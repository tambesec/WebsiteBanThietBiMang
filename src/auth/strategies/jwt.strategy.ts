import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * JWT Strategy for Passport
 * Validates JWT tokens and loads user data
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.access.secret') || 'default-secret',
    });
  }

  /**
   * Validate JWT payload and return user data
   * This is called automatically by Passport after token verification
   */
  async validate(payload: any) {
    // Payload contains: { sub: userId, email, role }
    const user = await this.prisma.users.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
      },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // This will be attached to request object as req.user
    return {
      sub: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };
  }
}
