import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.siteUser.create({
      data: {
        username: dto.username,
        email: dto.email,
        phone: dto.phone,
        passwordHash: hashedPassword,
        isEmailVerified: false,
        isActive: true,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles.map((ur) => ur.role.name),
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDto) {
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

    // Compare password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles.map((ur) => ur.role.name),
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      accessToken,
      refreshToken,
    };
  }

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

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.siteUser.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
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
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles.map((ur) => ur.role.name),
      };

      const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  async googleAuth(credential: string) {
    try {
      // Verify Google token
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Token Google không hợp lệ');
      }

      const { email, name, picture, sub: googleId } = payload;

      // Find or create user
      let user = await this.prisma.siteUser.findUnique({
        where: { email },
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
        
        user = await this.prisma.siteUser.create({
          data: {
            username,
            email,
            passwordHash: await bcrypt.hash(googleId, 10), // Use googleId as password hash
            isEmailVerified: true, // Google accounts are already verified
            isActive: true,
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

      // Generate JWT tokens
      const jwtPayload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles.map((ur) => ur.role.name),
      };

      const accessToken = this.jwtService.sign(jwtPayload, { expiresIn: '7d' });
      const refreshToken = this.jwtService.sign(jwtPayload, { expiresIn: '30d' });

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Google auth error:', error);
      throw new UnauthorizedException('Xác thực Google thất bại');
    }
  }
}
