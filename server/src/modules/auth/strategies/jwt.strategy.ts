import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';

export interface JwtPayload {
  sub: number;
  email: string;
  username: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'dev_jwt_secret_key_12345',
    });
  }

  async validate(payload: JwtPayload) {
    // Optionally verify user still exists and is active
    const user = await this.prisma.siteUser.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        isActive: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Tài khoản đang bị khóa');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      username: payload.username,
      roles: payload.roles,
    };
  }
}
