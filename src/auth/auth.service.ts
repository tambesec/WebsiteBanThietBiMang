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
  private readonly passwordHistoryCount: number;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.bcryptRounds = this.configService.get<number>('security.bcryptRounds') || 10;
    this.maxLoginAttempts = this.configService.get<number>('security.maxLoginAttempts') || 5;
    this.lockDurationMinutes = this.configService.get<number>('security.lockDurationMinutes') || 30;
    this.passwordHistoryCount = this.configService.get<number>('security.passwordHistoryCount') || 5;
  }

  /**
   * Register new user
   */
  async register(registerDto: RegisterDto) {
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
          phone,
          role: users_role.customer,
          is_active: 1,
          is_email_verified: 0,
        },
        select: {
          id: true,
          email: true,
          full_name: true,
          phone: true,
          role: true,
          created_at: true,
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
          details: JSON.stringify({ email: newUser.email }),
        },
      });

      return newUser;
    });

    this.logger.log(`New user registered: ${user.email}`);

    return {
      message: 'User registered successfully',
      user,
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
      throw new UnauthorizedException('This account uses OAuth login. Please login with Google.');
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

    // Create session
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
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
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
          users: true,
        },
      });

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if user is still active
      if (!session.users.is_active) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Generate new access token
      const accessToken = await this.generateAccessToken(session.users);

      return {
        access_token: accessToken,
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
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
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
   */
  private async handleFailedLogin(userId: number, ipAddress?: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return;
    }

    const newFailedAttempts = user.failed_login_attempts + 1;

    if (newFailedAttempts >= this.maxLoginAttempts) {
      // Lock account
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + this.lockDurationMinutes);

      await this.prisma.users.update({
        where: { id: userId },
        data: {
          failed_login_attempts: newFailedAttempts,
          locked_until: lockedUntil,
        },
      });

      await this.logSecurityEvent(userId, 'account_locked', ipAddress, {
        attempts: newFailedAttempts,
        locked_until: lockedUntil,
      });

      this.logger.warn(`Account locked: User ID ${userId}`);
    } else {
      await this.prisma.users.update({
        where: { id: userId },
        data: { failed_login_attempts: newFailedAttempts },
      });

      await this.logSecurityEvent(userId, 'login_failed', ipAddress, {
        attempts: newFailedAttempts,
      });
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
   * Validate and process OAuth user (Google, Facebook, etc.)
   * Security features:
   * - Token encryption
   * - Email verification required
   * - Automatic account linking
   * - Security logging
   */
  async validateOAuthUser(oauthData: {
    provider: string;
    providerId: string;
    email: string;
    full_name: string;
    profile_picture?: string;
    email_verified: boolean;
    accessToken?: string;
    refreshToken?: string;
  }) {
    const { provider, providerId, email, full_name, email_verified, accessToken, refreshToken, profile_picture } = oauthData;

    // Security: Require verified email from OAuth provider
    if (!email_verified) {
      throw new UnauthorizedException('Email not verified by OAuth provider');
    }

    // Check if OAuth account already exists
    const oauthAccount = await this.prisma.oauth_accounts.findFirst({
      where: {
        provider,
        provider_id: providerId,
      },
    });

    let user: users;

    if (oauthAccount) {
      // Get user from existing OAuth account
      const existingUser = await this.prisma.users.findUnique({
        where: { id: oauthAccount.user_id },
      });

      if (!existingUser) {
        throw new UnauthorizedException('User not found');
      }

      user = existingUser;

      // Security: Check if account is active
      if (!user.is_active) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Update OAuth tokens
      await this.prisma.oauth_accounts.update({
        where: { id: oauthAccount.id },
        data: {
          access_token: accessToken ? await this.encryptToken(accessToken) : null,
          refresh_token: refreshToken ? await this.encryptToken(refreshToken) : null,
          token_expires: this.calculateTokenExpiry(),
          provider_email: email,
          profile_data: JSON.stringify({ picture: profile_picture, last_login: new Date() }),
          updated_at: new Date(),
        },
      });

      this.logger.log(`OAuth account updated: ${provider} - ${email}`);
    } else {
      // Check if user with this email already exists
      const existingUser = await this.prisma.users.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Link OAuth account to existing user
        user = existingUser;

        await this.prisma.oauth_accounts.create({
          data: {
            user_id: user.id,
            provider,
            provider_id: providerId,
            provider_email: email,
            access_token: accessToken ? await this.encryptToken(accessToken) : null,
            refresh_token: refreshToken ? await this.encryptToken(refreshToken) : null,
            token_expires: this.calculateTokenExpiry(),
            profile_data: JSON.stringify({ picture: profile_picture }),
          },
        });

        this.logger.log(`OAuth account linked to existing user: ${provider} - ${email}`);
      } else {
        // Create new user with OAuth account using transaction
        user = await this.prisma.$transaction(async (prisma) => {
          const newUser = await prisma.users.create({
            data: {
              email,
              full_name: full_name || 'OAuth User',
              phone: null,
              password_hash: null,
              role: users_role.customer,
              is_active: 1,
              is_email_verified: 1,
            },
          });

          await prisma.oauth_accounts.create({
            data: {
              user_id: newUser.id,
              provider,
              provider_id: providerId,
              provider_email: email,
              access_token: accessToken ? await this.encryptToken(accessToken) : null,
              refresh_token: refreshToken ? await this.encryptToken(refreshToken) : null,
              token_expires: this.calculateTokenExpiry(),
              profile_data: JSON.stringify({ picture: profile_picture }),
            },
          });

          return newUser;
        });

        this.logger.log(`New user created via OAuth: ${provider} - ${email}`);
      }
    }

    // Update last login
    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        last_login: new Date(),
        failed_login_attempts: 0, // Reset failed attempts on successful OAuth login
        locked_until: null,
      },
    });

    // Log security event
    await this.logSecurityEvent(user.id, 'oauth_login', undefined, {
      provider: provider,
      email: email,
    });

    return user;
  }

  /**
   * Generate JWT tokens for OAuth user
   */
  async generateOAuthTokens(user: users) {
    return this.generateTokens(user);
  }

  /**
   * Encrypt OAuth tokens for secure storage
   * Security: Use crypto library for encryption
   */
  private async encryptToken(token: string): Promise<string> {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    const secret = this.configService.get<string>('security.encryptionKey') || 
                   this.configService.get<string>('jwt.access.secret');
    
    // Create encryption key from secret
    const key = crypto.scryptSync(secret, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt OAuth tokens
   */
  private async decryptToken(encryptedToken: string): Promise<string> {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    const secret = this.configService.get<string>('security.encryptionKey') || 
                   this.configService.get<string>('jwt.access.secret');
    
    const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
    const key = crypto.scryptSync(secret, 'salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Calculate token expiry (1 hour from now)
   */
  private calculateTokenExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    return expiry;
  }

  /**
   * Unlink OAuth provider from user account
   * Security: Ensure user has another login method
   */
  async unlinkOAuthProvider(userId: number, provider: string) {
    // Note: This will work after Prisma client is regenerated
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Count OAuth accounts
    const oauthCount = await this.prisma.oauth_accounts.count({
      where: { user_id: userId },
    });

    // Security: Ensure user has password or another OAuth provider
    if (!user.password_hash && oauthCount === 1) {
      throw new BadRequestException(
        'Cannot unlink the only login method. Please set a password first.',
      );
    }

    const result = await this.prisma.oauth_accounts.deleteMany({
      where: {
        user_id: userId,
        provider,
      },
    });

    if (result.count === 0) {
      throw new BadRequestException('OAuth provider not linked to this account');
    }

    await this.logSecurityEvent(userId, 'oauth_unlinked', undefined, { provider });

    return { message: `${provider} account unlinked successfully` };
  }

  /**
   * Get linked OAuth accounts for a user
   */
  async getOAuthAccounts(userId: number) {
    const accounts = await this.prisma.oauth_accounts.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        provider: true,
        provider_email: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      accounts: accounts.map(account => ({
        id: account.id,
        provider: account.provider,
        email: account.provider_email,
        linked_at: account.created_at,
      })),
    };
  }
}
