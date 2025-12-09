import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

/**
 * Google OAuth Strategy - Production Best Practice
 * 
 * Security Design:
 * - Only requests minimal scopes (email, profile)
 * - Does NOT store Google access_token/refresh_token
 * - Extracts only necessary user data
 * - Email is pre-verified by Google
 * 
 * Flow:
 * 1. User clicks "Sign in with Google"
 * 2. Redirected to Google OAuth consent screen
 * 3. Google redirects back with authorization code
 * 4. Passport exchanges code for user profile
 * 5. validate() extracts user data
 * 6. AuthService creates/links account
 * 7. Returns JWT token (our own auth system)
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('google.clientId') || '',
      clientSecret: configService.get<string>('google.clientSecret') || '',
      callbackURL: configService.get<string>('google.callbackUrl') || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
      // Best Practice: Minimal scopes
      // We don't need access to Drive, Gmail, Calendar, etc.
    });
  }

  /**
   * Validate Google OAuth response
   * 
   * @param accessToken - Google access token (NOT stored)
   * @param refreshToken - Google refresh token (NOT stored)
   * @param profile - User profile from Google
   * @param done - Passport callback
   * 
   * Best Practice: Extract only necessary data
   * Don't store tokens unless you need to call Google APIs
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName, photos, _json } = profile;

    // Extract minimal user data
    const oauthUser = {
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      emailVerified: emails[0].verified, // Google pre-verifies email
      fullName: displayName,
      firstName: _json.given_name || '',
      lastName: _json.family_name || '',
      avatarUrl: photos[0]?.value || null,
      locale: _json.locale || 'en',
    };

    // Pass to controller, AuthService will handle user creation
    done(null, oauthUser);
  }
}
