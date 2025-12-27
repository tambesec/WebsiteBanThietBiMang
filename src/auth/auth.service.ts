import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { users, users_role } from '@prisma/client';

/**
 * Auth Service - Core authentication business logic
 * Handles user registration, login, token generation, and security features
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly bcryptRounds: number;
  private readonly maxLoginAttempts: number;
  private readonly lockDurationMinutes: number;
  private readonly failedLoginWindowMinutes: number;
  private readonly passwordHistoryCount: number;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.bcryptRounds = this.configService.get<number>('security.bcryptRounds') || 10;
    this.maxLoginAttempts = this.configService.get<number>('security.maxLoginAttempts') || 5;
    this.lockDurationMinutes = this.configService.get<number>('security.lockDurationMinutes') || 30;
    this.failedLoginWindowMinutes = this.configService.get<number>('security.failedLoginWindowMinutes') || 15;
    this.passwordHistoryCount = this.configService.get<number>('security.passwordHistoryCount') || 5;
  }

  /**
   * Register new user (auto-login after registration)
   */
  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const { email, password, full_name, phone } = registerDto;

    // Check if email already exists
    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const password_hash = await this.hashPassword(password);

    // Use transaction to ensure data consistency
    const user = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const newUser = await prisma.users.create({
        data: {
          email,
          password_hash,
          full_name,
          phone: phone || null,
          role: users_role.customer,
          is_active: 1,
          is_email_verified: 0,
          last_login: new Date(),
        },
      });

      // Create password history entry
      await prisma.password_history.create({
        data: {
          user_id: newUser.id,
          password_hash,
        },
      });

      // Log security event
      await prisma.security_logs.create({
        data: {
          user_id: newUser.id,
          event_type: 'user_registered',
          ip_address: ipAddress?.substring(0, 45),
          details: JSON.stringify({ email: newUser.email }),
        },
      });

      return newUser;
    });

    this.logger.log(`New user registered: ${user.email}`);

    // Auto-login: Generate tokens
    const tokens = await this.generateTokens(user);

    // 🔒 SECURITY: Delete any old sessions (should not exist for new user, but ensure clean state)
    await this.prisma.user_sessions.deleteMany({
      where: { user_id: user.id },
    });

    // Create NEW session
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + 
      parseInt(this.configService.get('jwt.refresh.expiresIn').replace('d', ''))
    );

    await this.prisma.user_sessions.create({
      data: {
        user_id: user.id,
        token_hash: await this.hashToken(tokens.refresh_token),
        ip_address: ipAddress?.substring(0, 45),
        user_agent: userAgent?.substring(0, 255),
        expires_at: expiresAt,
      },
    });

    return {
      message: 'User registered successfully',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      await this.logSecurityEvent(null, 'login_failed', ipAddress, {
        email,
        reason: 'user_not_found',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remainingMinutes = Math.ceil(
        (new Date(user.locked_until).getTime() - new Date().getTime()) / 60000,
      );
      throw new UnauthorizedException(
        `Account is locked. Try again in ${remainingMinutes} minutes`,
      );
    }

    // Check if account is active
    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if user has password (not OAuth-only account)
    if (!user.password_hash) {
      // Get user's OAuth providers
      const oauthAccounts = await this.prisma.oauth_accounts.findMany({
        where: { user_id: user.id },
        select: { provider: true },
      });
      
      const providers = oauthAccounts.map(oa => oa.provider).join(', ');
      throw new UnauthorizedException(
        `This account uses OAuth login (${providers}). Please sign in via OAuth or set a password in settings.`
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      await this.handleFailedLogin(user.id, ipAddress);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login attempts on successful login
    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        failed_login_attempts: 0,
        locked_until: null,
        last_login: new Date(),
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // 🔒 SECURITY: Delete all old sessions (1 session per user)
    await this.prisma.user_sessions.deleteMany({
      where: { user_id: user.id },
    });

    // Create NEW session
    const expiresAt = new Date();
    const refreshExpiresIn = this.configService.get('jwt.refresh.expiresIn');
    const daysToAdd = parseInt(refreshExpiresIn.replace('d', ''));
    
    expiresAt.setDate(expiresAt.getDate() + daysToAdd);

    const tokenHash = await this.hashToken(tokens.refresh_token);

    await this.prisma.user_sessions.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        ip_address: ipAddress?.substring(0, 45),
        user_agent: userAgent?.substring(0, 255),
        expires_at: expiresAt,
      },
    });

    // Log security event
    await this.logSecurityEvent(user.id, 'login_success', ipAddress, {
      email: user.email,
    });

    this.logger.log(`User logged in: ${user.email}`);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }

  /**
   * Get session from refresh token (for /auth/session endpoint)
   * Returns user data if valid refresh token exists
   * Throws error if invalid/expired (caught by controller to return guest state)
   */
  async getSessionFromRefreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refresh.secret'),
      });

      // Check if session exists
      const tokenHash = await this.hashToken(refreshToken);
      const session = await this.prisma.user_sessions.findFirst({
        where: {
          user_id: payload.sub,
          token_hash: tokenHash,
          expires_at: { gt: new Date() },
        },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              full_name: true,
              phone: true,
              role: true,
              is_active: true,
              password_hash: true,
              oauth_accounts: {
                select: {
                  provider: true,
                  is_primary: true,
                },
              },
            },
          },
        },
      });

      if (!session || !session.users.is_active) {
        throw new UnauthorizedException('Invalid session');
      }

      const hasOAuth = session.users.oauth_accounts && session.users.oauth_accounts.length > 0;

      return {
        user: {
          id: session.users.id,
          email: session.users.email,
          full_name: session.users.full_name,
          phone: session.users.phone,
          role: session.users.role,
          is_oauth_user: hasOAuth, // Has OAuth = cannot change email
          has_password: !!session.users.password_hash,
          oauth_providers: session.users.oauth_accounts?.map(oa => oa.provider) || [],
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Refresh access token
   * Implements Token Rotation with Grace Period to prevent race conditions
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refresh.secret'),
      });

      // Check if session exists
      const tokenHash = await this.hashToken(refreshToken);
      
      
      // 🔒 GRACE PERIOD: Accept both current token AND previous token (within 30s)
      const gracePeriod = 30000; // 30 seconds
      const session = await this.prisma.user_sessions.findFirst({
        where: {
          user_id: payload.sub,
          OR: [
            // Current token
            { token_hash: tokenHash },
            // Previous token (if rotated within grace period)
            {
              previous_token_hash: tokenHash,
              rotated_at: { gt: new Date(Date.now() - gracePeriod) }
            }
          ],
          expires_at: { gt: new Date() },
        },
        include: {
          users: true,
        },
      });

      // 🚨 SECURITY: Detect token reuse attack
      if (!session) {
        // Check if token matches a previous_token_hash OUTSIDE grace period
        const reuseDetection = await this.prisma.user_sessions.findFirst({
          where: {
            user_id: payload.sub,
            previous_token_hash: tokenHash,
            rotated_at: { lte: new Date(Date.now() - gracePeriod) }, // Outside grace period
          },
        });

        if (reuseDetection) {
          // TOKEN REUSE DETECTED - Revoke all sessions
          this.logger.error(`[Security] Token reuse detected for user ${payload.sub}!`);
          await this.revokeAllSessions(payload.sub, 'token_reuse_detected');
          throw new UnauthorizedException('Token reuse detected. All sessions revoked.');
        }

        // Session not found and no reuse detected
        this.logger.warn(`[Refresh] Invalid refresh token for user_id: ${payload.sub}`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if user is still active
      if (!session.users.is_active) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Generate new tokens
      const accessToken = await this.generateAccessToken(session.users);
      const newRefreshToken = await this.generateRefreshToken(session.users);
      const newTokenHash = await this.hashToken(newRefreshToken);

      // 🔄 TOKEN ROTATION with Grace Period
      await this.prisma.user_sessions.update({
        where: { id: session.id },
        data: {
          previous_token_hash: session.token_hash, // Keep old token valid for 30s
          token_hash: newTokenHash,                 // Set new token
          rotated_at: new Date(),                   // Mark rotation time
        },
      });

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string, userId: number) {
    const tokenHash = await this.hashToken(refreshToken);
    
    // Delete session
    await this.prisma.user_sessions.deleteMany({
      where: {
        user_id: userId,
        token_hash: tokenHash,
      },
    });

    await this.logSecurityEvent(userId, 'logout', undefined);

    return { message: 'Logged out successfully' };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        is_active: true,
        is_email_verified: true,
        last_login: true,
        created_at: true,
        password_hash: true,
        oauth_accounts: {
          select: {
            provider: true,
            is_primary: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const hasOAuth = user.oauth_accounts && user.oauth_accounts.length > 0;

    // Don't expose password_hash
    const { password_hash, oauth_accounts, ...safeUser } = user;

    return {
      ...safeUser,
      is_oauth_user: hasOAuth, // Has OAuth = cannot change email (even with password)
      has_password: !!password_hash,
      oauth_providers: oauth_accounts?.map(oa => oa.provider) || [],
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: number, updateData: { full_name?: string; email?: string; phone?: string }) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        oauth_accounts: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user has OAuth account
    const hasOAuth = user.oauth_accounts && user.oauth_accounts.length > 0;

    // Prevent email change for ANY user with OAuth (even if they have password)
    if (updateData.email && updateData.email !== user.email) {
      if (hasOAuth) {
        throw new ConflictException(
          'Cannot change email for accounts linked with OAuth. Please unlink OAuth providers first.'
        );
      }

      // Check if new email is already taken
      const existingUser = await this.prisma.users.findUnique({
        where: { email: updateData.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already taken');
      }
    }

    // Update user profile
    const updatedUser = await this.prisma.users.update({
      where: { id: userId },
      data: {
        full_name: updateData.full_name ?? user.full_name,
        email: updateData.email ?? user.email,
        phone: updateData.phone ?? user.phone,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        is_active: true,
        is_email_verified: true,
        last_login: true,
        created_at: true,
      },
    });

    this.logger.log(`User profile updated: ${updatedUser.email}`);

    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }

  /**
   * Change password
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user has password set
    if (!user.password_hash) {
      throw new BadRequestException('Cannot change password for OAuth-only accounts. Please set a password first.');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new password is same as current password
    const isSameAsCurrentPassword = await bcrypt.compare(newPassword, user.password_hash);
    if (isSameAsCurrentPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Check if new password was used before
    const isPasswordReused = await this.isPasswordReused(userId, newPassword);
    if (isPasswordReused) {
      throw new BadRequestException(
        `Cannot reuse any of your last ${this.passwordHistoryCount} passwords`,
      );
    }

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword);

    // Use transaction to ensure all operations succeed or fail together
    await this.prisma.$transaction(async (prisma) => {
      // Update password
      await prisma.users.update({
        where: { id: userId },
        data: { password_hash: newPasswordHash },
      });

      // Add to password history
      await prisma.password_history.create({
        data: {
          user_id: userId,
          password_hash: newPasswordHash,
        },
      });

      // Clean up old password history
      const histories = await prisma.password_history.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip: this.passwordHistoryCount,
      });

      if (histories.length > 0) {
        await prisma.password_history.deleteMany({
          where: {
            id: { in: histories.map((h) => h.id) },
          },
        });
      }

      // Invalidate all sessions
      await prisma.user_sessions.deleteMany({
        where: { user_id: userId },
      });

      // Log security event
      await prisma.security_logs.create({
        data: {
          user_id: userId,
          event_type: 'password_changed',
        },
      });
    });

    return { message: 'Password changed successfully. Please login again.' };
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(user: users) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.generateAccessToken(user),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refresh.secret'),
        expiresIn: this.configService.get('jwt.refresh.expiresIn'),
      }),
    ]);

    return { access_token, refresh_token };
  }

  /**
   * Generate access token only
   */
  private async generateAccessToken(user: users) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.access.secret'),
      expiresIn: this.configService.get('jwt.access.expiresIn'),
    });
  }

  /**
   * Generate refresh token only
   */
  private async generateRefreshToken(user: users) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt.refresh.secret'),
      expiresIn: this.configService.get('jwt.refresh.expiresIn'),
    });
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  /**
   * Hash token for storage
   */
  private async hashToken(token: string): Promise<string> {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Handle failed login attempt
   * Uses time window: counts failed attempts within X minutes from security_logs
   * IMPORTANT: Only counts failed attempts AFTER the last successful login (if any)
   */
  private async handleFailedLogin(userId: number, ipAddress?: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return;
    }

    // Log the failed attempt first
    await this.logSecurityEvent(userId, 'login_failed', ipAddress);

    // Calculate time window start (X minutes ago)
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - this.failedLoginWindowMinutes);

    // Use the MORE RECENT of: window start OR last successful login
    // This ensures failed attempts are reset after a successful login
    const countSince = user.last_login && user.last_login > windowStart
      ? user.last_login
      : windowStart;

    const recentFailedAttempts = await this.prisma.security_logs.count({
      where: {
        user_id: userId,
        event_type: 'login_failed',
        created_at: { gte: countSince },
      },
    });

    // Update failed_login_attempts in users table (for reference)
    await this.prisma.users.update({
      where: { id: userId },
      data: { failed_login_attempts: recentFailedAttempts },
    });

    if (recentFailedAttempts >= this.maxLoginAttempts) {
      // Lock account
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + this.lockDurationMinutes);

      await this.prisma.users.update({
        where: { id: userId },
        data: { locked_until: lockedUntil },
      });

      await this.logSecurityEvent(userId, 'account_locked', ipAddress, {
        attempts: recentFailedAttempts,
        window_minutes: this.failedLoginWindowMinutes,
        locked_until: lockedUntil,
      });

      this.logger.warn(`Account locked: User ID ${userId} (${recentFailedAttempts} failed attempts in ${this.failedLoginWindowMinutes} minutes)`);
    }
  }

  /**
   * Add password to history
   */
  private async addPasswordHistory(userId: number, passwordHash: string) {
    await this.prisma.password_history.create({
      data: {
        user_id: userId,
        password_hash: passwordHash,
      },
    });

    // Keep only last N passwords
    const histories = await this.prisma.password_history.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      skip: this.passwordHistoryCount,
    });

    if (histories.length > 0) {
      await this.prisma.password_history.deleteMany({
        where: {
          id: { in: histories.map((h) => h.id) },
        },
      });
    }
  }

  /**
   * Check if password was used before
   */
  private async isPasswordReused(userId: number, newPassword: string): Promise<boolean> {
    const histories = await this.prisma.password_history.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: this.passwordHistoryCount,
    });

    for (const history of histories) {
      const matches = await bcrypt.compare(newPassword, history.password_hash);
      if (matches) {
        return true;
      }
    }

    return false;
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(
    userId: number | null,
    eventType: string,
    ipAddress?: string,
    details?: any,
  ) {
    await this.prisma.security_logs.create({
      data: {
        user_id: userId,
        event_type: eventType,
        ip_address: ipAddress?.substring(0, 45),
        details: details ? JSON.stringify(details) : null,
      },
    });
  }

  /**
   * Revoke all sessions for a user (used when token reuse detected)
   */
  private async revokeAllSessions(userId: number, reason: string) {
    const deletedCount = await this.prisma.user_sessions.deleteMany({
      where: { user_id: userId },
    });

    await this.logSecurityEvent(userId, 'all_sessions_revoked', undefined, {
      reason,
      deleted_count: deletedCount.count,
    });

    this.logger.warn(`[Security] All sessions revoked for user ${userId}: ${reason}`);
  }

  /**
   * Forgot password - Generate reset token and send email
   */
  async forgotPassword(email: string, ipAddress?: string) {
    // Find user by email
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    // IMPORTANT: Don't reveal if email exists or not (security best practice)
    // Always return same message to prevent email enumeration attacks
    const response = {
      message: 'If the email exists, a password reset link has been sent',
    };

    if (!user) {
      // Log attempt for security monitoring
      await this.logSecurityEvent(null, 'password_reset_failed', ipAddress, {
        email,
        reason: 'user_not_found',
      });
      return response;
    }

    // Check if account is active
    if (!user.is_active) {
      await this.logSecurityEvent(user.id, 'password_reset_failed', ipAddress, {
        reason: 'account_inactive',
      });
      return response;
    }

    // Generate cryptographically secure random token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await this.hashToken(resetToken);

    // Token expires in 30 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    await this.prisma.$transaction(async (prisma) => {
      // Delete any existing password reset tokens for this user
      await prisma.verification_tokens.deleteMany({
        where: {
          user_id: user.id,
          token_type: 'password_reset',
        },
      });

      // Create new reset token
      await prisma.verification_tokens.create({
        data: {
          user_id: user.id,
          token_hash: tokenHash,
          token_type: 'password_reset',
          expires_at: expiresAt,
        },
      });

      // Log security event
      await prisma.security_logs.create({
        data: {
          user_id: user.id,
          event_type: 'password_reset_requested',
          ip_address: ipAddress?.substring(0, 45),
        },
      });
    });

    // TODO: Send email with reset link
    // const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    // await this.emailService.sendPasswordResetEmail(user.email, resetUrl);
    
    this.logger.log(`Password reset requested for: ${user.email}`);

    return response;
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string, ipAddress?: string) {
    // Hash the token to find in database
    const tokenHash = await this.hashToken(token);

    // Find valid token
    const tokenRecord = await this.prisma.verification_tokens.findFirst({
      where: {
        token_hash: tokenHash,
        token_type: 'password_reset',
        expires_at: { gt: new Date() },
      },
      include: {
        users: true,
      },
    });

    if (!tokenRecord) {
      await this.logSecurityEvent(null, 'password_reset_invalid_token', ipAddress);
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = tokenRecord.users;

    // Check if account is active
    if (!user.is_active) {
      throw new BadRequestException('Account is deactivated');
    }

    // Check if new password was used before
    const isPasswordReused = await this.isPasswordReused(user.id, newPassword);
    if (isPasswordReused) {
      throw new BadRequestException(
        `Cannot reuse any of your last ${this.passwordHistoryCount} passwords`,
      );
    }

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword);

    // Use transaction to ensure all operations succeed or fail together
    await this.prisma.$transaction(async (prisma) => {
      // Update password
      await prisma.users.update({
        where: { id: user.id },
        data: {
          password_hash: newPasswordHash,
          failed_login_attempts: 0,
          locked_until: null,
        },
      });

      // Add to password history
      await prisma.password_history.create({
        data: {
          user_id: user.id,
          password_hash: newPasswordHash,
        },
      });

      // Clean up old password history
      const histories = await prisma.password_history.findMany({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
        skip: this.passwordHistoryCount,
      });

      if (histories.length > 0) {
        await prisma.password_history.deleteMany({
          where: {
            id: { in: histories.map((h) => h.id) },
          },
        });
      }

      // Delete the used token (one-time use)
      await prisma.verification_tokens.delete({
        where: { id: tokenRecord.id },
      });

      // Delete all other password reset tokens for this user
      await prisma.verification_tokens.deleteMany({
        where: {
          user_id: user.id,
          token_type: 'password_reset',
        },
      });

      // Invalidate all existing sessions (force re-login)
      await prisma.user_sessions.deleteMany({
        where: { user_id: user.id },
      });

      // Log security event
      await prisma.security_logs.create({
        data: {
          user_id: user.id,
          event_type: 'password_reset_success',
          ip_address: ipAddress?.substring(0, 45),
        },
      });
    });

    this.logger.log(`Password reset successful for user ID: ${user.id}`);

    return {
      message: 'Password reset successfully. Please login with your new password.',
    };
  }

  // ==================== OAuth Methods - Best Practice ====================

  /**
   * Validate OAuth User (Google, Facebook, etc.)
   * 
   * Best Practice Flow:
   * 1. Check if OAuth account exists → Login existing user
   * 2. Check if email exists → Link OAuth to existing account
   * 3. Create new user + OAuth account
   * 
   * Security: Email from OAuth is pre-verified by provider
   */
  async validateOAuthUser(oauthData: {
    provider: string;
    providerId: string;
    email: string;
    emailVerified: boolean;
    fullName: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }) {
    // 1. Check if OAuth account already linked
    const existingOAuth = await this.prisma.oauth_accounts.findUnique({
      where: {
        provider_provider_user_id: {
          provider: oauthData.provider as any,
          provider_user_id: oauthData.providerId,
        },
      },
      include: {
        users: true,
      },
    });

    if (existingOAuth) {
      // OAuth account exists → Login
      const user = existingOAuth.users;

      if (!user.is_active) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Update last login
      await this.prisma.users.update({
        where: { id: user.id },
        data: { last_login: new Date() },
      });

      // Log security event
      await this.logSecurityEvent(user.id, 'oauth_login_success', undefined, {
        provider: oauthData.provider,
        email: user.email,
      });

      this.logger.log(`OAuth login: ${user.email} via ${oauthData.provider}`);

      // Generate JWT tokens
      const tokens = await this.generateTokens(user);

      // 🔒 SECURITY: Delete old sessions (1 session per user)
      await this.prisma.user_sessions.deleteMany({
        where: { user_id: user.id },
      });

      // Create NEW session in database
      const expiresAt = new Date();
      expiresAt.setDate(
        expiresAt.getDate() + 
        parseInt(this.configService.get('jwt.refresh.expiresIn').replace('d', ''))
      );

      await this.prisma.user_sessions.create({
        data: {
          user_id: user.id,
          token_hash: await this.hashToken(tokens.refresh_token),
          expires_at: expiresAt,
        },
      });

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      };
    }

    // 2. Check if user with same email exists
    let user = await this.prisma.users.findUnique({
      where: { email: oauthData.email },
    });

    if (user) {
      // User exists → Link OAuth account
      // Best Practice: This allows users to have multiple login methods

      await this.prisma.oauth_accounts.create({
        data: {
          user_id: user.id,
          provider: oauthData.provider as any,
          provider_user_id: oauthData.providerId,
          provider_email: oauthData.email,
          provider_username: oauthData.fullName,
          avatar_url: oauthData.avatarUrl,
          is_primary: user.password_hash ? 0 : 1, // Primary if no password
        },
      });

      // Update user info if better from OAuth
      const updateData: any = {
        last_login: new Date(),
      };

      if (!user.is_email_verified && oauthData.emailVerified) {
        updateData.is_email_verified = 1;
      }

      await this.prisma.users.update({
        where: { id: user.id },
        data: updateData,
      });

      await this.logSecurityEvent(user.id, 'oauth_account_linked', undefined, {
        provider: oauthData.provider,
      });

      this.logger.log(`OAuth linked: ${user.email} → ${oauthData.provider}`);
    } else {
      // 3. Create new user with OAuth
      // Best Practice: Use transaction for atomicity

      const result = await this.prisma.$transaction(async (prisma) => {
        // Create user
        const newUser = await prisma.users.create({
          data: {
            email: oauthData.email,
            full_name: oauthData.fullName,
            phone: undefined, // OAuth doesn't provide phone
            password_hash: undefined, // OAuth user has no password
            role: users_role.customer,
            is_active: 1,
            is_email_verified: oauthData.emailVerified ? 1 : 0,
            last_login: new Date(),
          },
        });

        // Create OAuth account
        await prisma.oauth_accounts.create({
          data: {
            user_id: newUser.id,
            provider: oauthData.provider as any,
            provider_user_id: oauthData.providerId,
            provider_email: oauthData.email,
            provider_username: oauthData.fullName,
            avatar_url: oauthData.avatarUrl,
            is_primary: 1, // First login method is primary
          },
        });

        // Log security event
        await prisma.security_logs.create({
          data: {
            user_id: newUser.id,
            event_type: 'oauth_user_registered',
            details: JSON.stringify({
              provider: oauthData.provider,
              email: newUser.email,
            }),
          },
        });

        return newUser;
      });

      user = result;

      this.logger.log(`New OAuth user: ${user.email} via ${oauthData.provider}`);
    }

    // Generate JWT tokens
    const tokens = await this.generateTokens(user);

    // 🔒 SECURITY: Delete old sessions (1 session per user)
    await this.prisma.user_sessions.deleteMany({
      where: { user_id: user.id },
    });

    // Create NEW session in database
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + 
      parseInt(this.configService.get('jwt.refresh.expiresIn').replace('d', ''))
    );

    await this.prisma.user_sessions.create({
      data: {
        user_id: user.id,
        token_hash: await this.hashToken(tokens.refresh_token),
        expires_at: expiresAt,
      },
    });

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }

  /**
   * Get user's linked OAuth accounts
   * Best Practice: Let users see and manage their login methods
   */
  async getOAuthAccounts(userId: number) {
    const oauthAccounts = await this.prisma.oauth_accounts.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        provider: true,
        provider_email: true,
        provider_username: true,
        avatar_url: true,
        is_primary: true,
        created_at: true,
      },
      orderBy: [
        { is_primary: 'desc' },
        { created_at: 'asc' },
      ],
    });

    return oauthAccounts;
  }

  /**
   * Unlink OAuth account
   * Best Practice: Allow users to unlink login methods
   * 
   * Security: Prevent unlinking if it's the only login method
   */
  async unlinkOAuthAccount(userId: number, provider: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        oauth_accounts: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Security check: Don't allow unlinking if it's the only login method
    const hasPassword = !!user.password_hash;
    const oauthCount = user.oauth_accounts.length;

    if (!hasPassword && oauthCount <= 1) {
      throw new BadRequestException(
        'Cannot unlink the only login method. Please set a password first.',
      );
    }

    const oauthAccount = user.oauth_accounts.find((oa) => oa.provider === provider);

    if (!oauthAccount) {
      throw new BadRequestException('OAuth account not found');
    }

    await this.prisma.oauth_accounts.delete({
      where: { id: oauthAccount.id },
    });

    await this.logSecurityEvent(userId, 'oauth_account_unlinked', undefined, {
      provider,
    });

    this.logger.log(`OAuth unlinked: User ${userId} from ${provider}`);

    return {
      message: `${provider} account unlinked successfully`,
    };
  }

  /**
   * Set password for OAuth-only users
   * Best Practice: Allow OAuth users to add password login
   */
  async setPasswordForOAuthUser(userId: number, password: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.password_hash) {
      throw new BadRequestException('Password already set. Use change password instead.');
    }

    // Validate password strength (same rules as RegisterDto)
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
    }

    // Check password history (in case user previously had password then removed it)
    const isPasswordReused = await this.isPasswordReused(userId, password);
    if (isPasswordReused) {
      throw new BadRequestException(
        `Cannot reuse any of your last ${this.passwordHistoryCount} passwords`
      );
    }

    const password_hash = await this.hashPassword(password);

    await this.prisma.$transaction(async (prisma) => {
      // Set password
      await prisma.users.update({
        where: { id: userId },
        data: { password_hash },
      });

      // Create password history
      await prisma.password_history.create({
        data: {
          user_id: userId,
          password_hash,
        },
      });

      // Log security event
      await prisma.security_logs.create({
        data: {
          user_id: userId,
          event_type: 'password_set',
          details: JSON.stringify({ method: 'oauth_user_set_password' }),
        },
      });
    });

    this.logger.log(`Password set for OAuth user ID: ${userId}`);

    return {
      message: 'Password set successfully. You can now login with email and password.',
    };
  }
}
