import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

/**
 * Google OAuth2 Strategy
 * Handles Google authentication with security best practices:
 * - Email verification required
 * - Profile data validation
 * - Secure token handling
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('oauth.google.clientId') || '',
      clientSecret: configService.get<string>('oauth.google.clientSecret') || '',
      callbackURL: configService.get<string>('oauth.google.callbackUrl') || '',
      scope: ['email', 'profile'], // Minimal scopes for security
    });
  }

  /**
   * Validate and process Google OAuth response
   * Security checks:
   * - Verified email required
   * - Profile data sanitization
   * - Rate limiting via service layer
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      // Extract email from verified emails only
      const email = profile.emails?.find(email => email.verified)?.value;
      
      if (!email) {
        this.logger.warn(`Google OAuth: No verified email for profile ${profile.id}`);
        return done(new Error('No verified email found'), false);
      }

      // Security: Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.logger.warn(`Google OAuth: Invalid email format ${email}`);
        return done(new Error('Invalid email format'), false);
      }

      // Extract profile data
      const userData = {
        provider: 'google',
        providerId: profile.id,
        email: email.toLowerCase().trim(), // Normalize email
        full_name: `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
        profile_picture: profile.photos?.[0]?.value,
        email_verified: true,
        accessToken, // Will be encrypted by service
        refreshToken, // Will be encrypted by service
      };

      // Process OAuth login via service
      const user = await this.authService.validateOAuthUser(userData);

      this.logger.log(`Google OAuth success: ${email}`);
      
      done(null, user);
    } catch (error) {
      this.logger.error(`Google OAuth validation failed: ${error.message}`);
      done(error, false);
    }
  }
}
