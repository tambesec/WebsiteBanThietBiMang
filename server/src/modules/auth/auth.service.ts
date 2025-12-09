import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
  }

  // ==================== REGISTRATION ====================
  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.siteUser.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email đã được sử dụng');
      }
      throw new ConflictException('Tên đăng nhập đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Create fullName from firstName and lastName
    const fullName =
      dto.firstName && dto.lastName
        ? `${dto.firstName} ${dto.lastName}`
        : dto.firstName || dto.lastName || null;

    // Create user with default customer role
    const user = await this.prisma.$transaction(async (tx) => {
      // First, ensure customer role exists
      let customerRole = await tx.role.findUnique({
        where: { name: 'customer' },
      });

      if (!customerRole) {
        customerRole = await tx.role.create({
          data: {
            name: 'customer',
            description: 'Default customer role',
          },
        });
      }

      // Create user
      const newUser = await tx.siteUser.create({
        data: {
          username: dto.username,
          email: dto.email,
          phone: dto.phone,
          firstName: dto.firstName,
          lastName: dto.lastName,
          fullName,
          passwordHash: hashedPassword,
          isEmailVerified: false,
          isActive: true,
        },
      });

      // Assign customer role
      await tx.userRole.create({
        data: {
          userId: newUser.id,
          roleId: customerRole.id,
        },
      });

      return newUser;
    });

    // Get user with roles
    const userWithRoles = await this.prisma.siteUser.findUnique({
      where: { id: user.id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(userWithRoles);

    // Create session
    await this.createSession(user.id, tokens.refreshToken);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      ...tokens,
    };
  }

  // ==================== LOGIN ====================
  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    // Find user by email
    const user = await this.prisma.siteUser.findUnique({
      where: { email: dto.email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Email không tồn tại');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
      throw new UnauthorizedException(
        `Tài khoản tạm khóa. Vui lòng thử lại sau ${remainingMinutes} phút`,
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed login count
      const newFailedCount = user.failedLoginCount + 1;
      const lockUntil = newFailedCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // Lock for 15 minutes after 5 failed attempts

      await this.prisma.siteUser.update({
        where: { id: user.id },
        data: {
          failedLoginCount: newFailedCount,
          lockedUntil: lockUntil,
        },
      });

      // Log failed attempt
      await this.logSecurityEvent(user.id, 'LOGIN_FAILED', ipAddress, userAgent);

      if (newFailedCount >= 5) {
        throw new UnauthorizedException('Quá nhiều lần thử sai. Tài khoản tạm khóa 15 phút');
      }

      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    // Reset failed login count on successful login
    if (user.failedLoginCount > 0 || user.lockedUntil) {
      await this.prisma.siteUser.update({
        where: { id: user.id },
        data: {
          failedLoginCount: 0,
          lockedUntil: null,
        },
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Create session
    await this.createSession(user.id, tokens.refreshToken, ipAddress, userAgent);

    // Log successful login
    await this.logSecurityEvent(user.id, 'LOGIN_SUCCESS', ipAddress, userAgent);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatar: user.avatar,
      roles: user.roles.map((ur) => ur.role.name),
      ...tokens,
    };
  }

  // ==================== LOGOUT ====================
  async logout(userId: number, refreshToken?: string) {
    if (refreshToken) {
      // Delete specific session by refresh token
      await this.prisma.userSession.deleteMany({
        where: {
          userId,
          refreshToken,
        },
      });
    } else {
      // Delete all sessions for this user
      await this.prisma.userSession.deleteMany({
        where: { userId },
      });
    }

    await this.logSecurityEvent(userId, 'LOGOUT');

    return { message: 'Đăng xuất thành công' };
  }

  // ==================== GOOGLE AUTH ====================
  async googleAuth(credential: string, ipAddress?: string, userAgent?: string) {
    try {
      // Verify Google token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Token Google không hợp lệ');
      }

      const { email, given_name, family_name, picture, sub: googleId } = payload;

      // Find user by email or googleId
      let user = await this.prisma.siteUser.findFirst({
        where: {
          OR: [{ email }, { googleId }],
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        // Create new user with Google account
        const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(7);
        const fullName = given_name && family_name ? `${given_name} ${family_name}` : given_name;

        user = await this.prisma.$transaction(async (tx) => {
          // Ensure customer role exists
          let customerRole = await tx.role.findUnique({
            where: { name: 'customer' },
          });

          if (!customerRole) {
            customerRole = await tx.role.create({
              data: {
                name: 'customer',
                description: 'Default customer role',
              },
            });
          }

          // Create user
          const newUser = await tx.siteUser.create({
            data: {
              username,
              email,
              googleId,
              firstName: given_name,
              lastName: family_name,
              fullName,
              avatar: picture,
              passwordHash: await bcrypt.hash(
                googleId + crypto.randomBytes(16).toString('hex'),
                12,
              ),
              isEmailVerified: true, // Google accounts are already verified
              isActive: true,
            },
          });

          // Assign customer role
          await tx.userRole.create({
            data: {
              userId: newUser.id,
              roleId: customerRole.id,
            },
          });

          return tx.siteUser.findUnique({
            where: { id: newUser.id },
            include: {
              roles: {
                include: {
                  role: true,
                },
              },
            },
          });
        });
      } else if (!user.googleId) {
        // Link Google account to existing user
        user = await this.prisma.siteUser.update({
          where: { id: user.id },
          data: {
            googleId,
            avatar: user.avatar || picture,
            firstName: user.firstName || given_name,
            lastName: user.lastName || family_name,
            fullName:
              user.fullName ||
              (given_name && family_name ? `${given_name} ${family_name}` : given_name),
          },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        });
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Create session
      await this.createSession(user.id, tokens.refreshToken, ipAddress, userAgent);

      // Log successful login
      await this.logSecurityEvent(user.id, 'GOOGLE_LOGIN_SUCCESS', ipAddress, userAgent);

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatar: user.avatar,
        roles: user.roles.map((ur) => ur.role.name),
        ...tokens,
      };
    } catch (error) {
      console.error('Google auth error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Xác thực Google thất bại');
    }
  }

  // ==================== GET PROFILE ====================
  async getProfile(userId: number) {
    const user = await this.prisma.siteUser.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        addresses: {
          include: {
            address: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      phone: user.phone,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      roles: user.roles.map((ur) => ur.role.name),
      addresses: user.addresses.map((ua) => ({
        id: ua.address.id,
        recipientName: ua.address.recipientName,
        phone: ua.address.phone,
        streetAddress: ua.address.streetAddress,
        ward: ua.address.ward,
        district: ua.address.district,
        city: ua.address.city,
        country: ua.address.country,
        addressType: ua.addressType,
        isDefault: ua.isDefault,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // ==================== UPDATE PROFILE ====================
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.siteUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Build fullName
    const firstName = dto.firstName !== undefined ? dto.firstName : user.firstName;
    const lastName = dto.lastName !== undefined ? dto.lastName : user.lastName;
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName;

    const updatedUser = await this.prisma.siteUser.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        fullName,
        phone: dto.phone,
        avatar: dto.avatar,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      roles: updatedUser.roles.map((ur) => ur.role.name),
      updatedAt: updatedUser.updatedAt,
    };
  }

  // ==================== CHANGE PASSWORD ====================
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.siteUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu cũ');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and save to history
    await this.prisma.$transaction([
      this.prisma.siteUser.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
      }),
      this.prisma.passwordHistory.create({
        data: {
          userId,
          passwordHash: user.passwordHash, // Save old password to history
        },
      }),
    ]);

    await this.logSecurityEvent(userId, 'PASSWORD_CHANGED');

    return { message: 'Đổi mật khẩu thành công' };
  }

  // ==================== FORGOT PASSWORD ====================
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.siteUser.findUnique({
      where: { email: dto.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens for this user
    await this.prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        tokenType: 'PASSWORD_RESET',
      },
    });

    // Create new reset token
    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        tokenType: 'PASSWORD_RESET',
        expiresAt,
      },
    });

    // TODO: Send email with resetToken
    // For now, log the token (remove in production)
    console.log(`Password reset token for ${dto.email}: ${resetToken}`);

    await this.logSecurityEvent(user.id, 'PASSWORD_RESET_REQUESTED');

    return {
      message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu',
      // Include token in dev mode only
      ...(this.configService.get('NODE_ENV') === 'development' && { resetToken }),
    };
  }

  // ==================== RESET PASSWORD ====================
  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');

    const verificationToken = await this.prisma.verificationToken.findFirst({
      where: {
        tokenHash,
        tokenType: 'PASSWORD_RESET',
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!verificationToken) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    // Update password and delete token
    await this.prisma.$transaction([
      this.prisma.siteUser.update({
        where: { id: verificationToken.userId },
        data: { passwordHash: hashedPassword },
      }),
      this.prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      }),
      this.prisma.passwordHistory.create({
        data: {
          userId: verificationToken.userId,
          passwordHash: verificationToken.user.passwordHash,
        },
      }),
    ]);

    // Invalidate all sessions
    await this.prisma.userSession.deleteMany({
      where: { userId: verificationToken.userId },
    });

    await this.logSecurityEvent(verificationToken.userId, 'PASSWORD_RESET_SUCCESS');

    return { message: 'Đặt lại mật khẩu thành công' };
  }

  // ==================== REFRESH TOKEN ====================
  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      // Find session with this refresh token
      const session = await this.prisma.userSession.findFirst({
        where: {
          userId: payload.sub,
          refreshToken,
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) {
        throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
      }

      const user = await this.prisma.siteUser.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Tài khoản không hợp lệ');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update session with new refresh token
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: {
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  // ==================== ADMIN LOGIN ====================
  async adminLogin(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const result = await this.login(dto, ipAddress, userAgent);

    // Verify user has admin role
    if (!result.roles.includes('admin') && !result.roles.includes('super_admin')) {
      await this.logSecurityEvent(result.id, 'ADMIN_LOGIN_UNAUTHORIZED', ipAddress, userAgent);
      throw new UnauthorizedException('Bạn không có quyền truy cập admin');
    }

    await this.logSecurityEvent(result.id, 'ADMIN_LOGIN_SUCCESS', ipAddress, userAgent);

    return result;
  }

  // ==================== HELPER METHODS ====================
  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles?.map((ur: any) => ur.role.name) || [],
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES') || '30d',
    });

    return { accessToken, refreshToken };
  }

  private async createSession(
    userId: number,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await this.prisma.userSession.create({
      data: {
        userId,
        tokenHash,
        refreshToken,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });
  }

  private async logSecurityEvent(
    userId: number,
    eventType: string,
    ipAddress?: string,
    userAgent?: string,
    details?: any,
  ) {
    await this.prisma.securityLog.create({
      data: {
        userId,
        eventType,
        ipAddress,
        userAgent,
        details,
      },
    });
  }
}
