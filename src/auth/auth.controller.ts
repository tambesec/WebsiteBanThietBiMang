import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  LogoutDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import type { Request } from 'express';

/**
 * Auth Controller - Handles all authentication endpoints
 * All routes are public by default except those using JwtAuthGuard
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Register a new user account and auto-login
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account and auto-login' })
  @ApiResponse({ status: 201, description: 'User registered and logged in successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.register(registerDto, ipAddress, userAgent);

    // Set tokens in HTTP-only cookies (auto-login after register)
    if (result.access_token && result.refresh_token) {
      const isDev = process.env.NODE_ENV !== 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: false, // Must be false for localhost HTTP
        sameSite: 'lax' as const, // lax works for localhost same-site
        path: '/',
      };
      
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    // Return only user data
    return {
      message: result.message,
      user: result.user,
    };
  }

  /**
   * POST /auth/login
   * Login with email and password (for client app - uses cookies)
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, tokens set in HTTP-only cookies',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or account locked',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.login(loginDto, ipAddress, userAgent);

    // Set tokens in HTTP-only cookies
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return only user data (no tokens)
    return {
      message: 'Login successful',
      user: result.user,
    };
  }

  /**
   * GET /auth/session
   * Get current session state - NEVER returns 401
   * Returns { authenticated: false } for guest
   * Returns { authenticated: true, user } for logged-in user
   * Uses refresh token from cookie to determine state
   */
  @Public()
  @Get('session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current session state (guest or authenticated)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Session state returned (never 401)' 
  })
  async getSession(@Req() req: Request) {
    const refreshToken = (req as any).cookies?.refresh_token;

    // No refresh token = guest
    if (!refreshToken) {
      return {
        authenticated: false,
        user: null,
      };
    }

    try {
      // Try to get user from refresh token
      const session = await this.authService.getSessionFromRefreshToken(refreshToken);
      
      return {
        authenticated: true,
        user: session.user,
      };
    } catch (error) {
      // Invalid/expired refresh token = guest
      return {
        authenticated: false,
        user: null,
      };
    }
  }

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token from cookie
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token from cookie' })
  @ApiResponse({ status: 200, description: 'New access token set in cookie' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req as any).cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refreshToken(refreshToken);

    // Set new access token in cookie
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return { message: 'Token refreshed successfully' };
  }

  /**
   * POST /auth/logout
   * Logout and clear cookies
   * No body needed - uses refresh_token from cookies
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and clear cookies (no body needed)' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
      await this.authService.logout(refreshToken, req.user.id);
    }

    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logged out successfully' };
  }

  /**
   * GET /auth/profile
   * Get current user profile (requires authentication)
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  /**
   * PATCH /auth/profile
   * Update current user profile (requires authentication)
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already taken' })
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: any,
  ) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }

  /**
   * POST /auth/change-password
   * Change user password (requires authentication)
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Current password incorrect or password reused',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: any,
  ) {
    return this.authService.changePassword(
      req.user.id,
      changePasswordDto.current_password,
      changePasswordDto.new_password,
    );
  }

  /**
   * POST /auth/forgot-password
   * Request password reset token
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiResponse({
    status: 200,
    description: 'If email exists, reset link sent (same response for security)',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.forgotPassword(forgotPasswordDto.email, ipAddress);
  }

  /**
   * POST /auth/reset-password
   * Reset password using token from email
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.new_password,
      ipAddress,
    );
  }

  // ==================== OAuth Endpoints - Best Practice ====================

  /**
   * GET /auth/google
   * Initiates Google OAuth flow
   * Redirects user to Google login page
   */
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google (redirects to Google)' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  googleAuth() {
    // Guard handles redirect automatically
    // This method will never execute
  }

  /**
   * GET /auth/google/callback
   * Google redirects here after user authorization
   * Best Practice: Redirect to frontend with tokens
   */
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback (handled automatically)' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with token' })
  async googleAuthCallback(@Req() req: any, @Res() res: any) {
    // req.user contains data from GoogleStrategy
    try {
      const result = await this.authService.validateOAuthUser(req.user);

      // Set tokens in HTTP-only cookies (CRITICAL for auth to work)
      // IMPORTANT: No domain specified = cookies work across localhost:3000 and localhost:3001
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: false, // Must be false for localhost
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: false, // Must be false for localhost
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to frontend callback page
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/auth/callback`;

      return res.redirect(redirectUrl);
    } catch (error) {
      // Error handling: Redirect to frontend error page
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const errorUrl = `${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`;

      return res.redirect(errorUrl);
    }
  }

  /**
   * GET /auth/oauth-accounts
   * Get user's linked OAuth accounts
   */
  @UseGuards(JwtAuthGuard)
  @Get('oauth-accounts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get linked OAuth accounts' })
  @ApiResponse({ status: 200, description: 'List of linked OAuth accounts' })
  async getOAuthAccounts(@Req() req: any) {
    return this.authService.getOAuthAccounts(req.user.id);
  }

  /**
   * POST /auth/unlink-oauth
   * Unlink OAuth account
   */
  @UseGuards(JwtAuthGuard)
  @Post('unlink-oauth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlink OAuth account' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: ['google', 'facebook', 'github'],
          example: 'google',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'OAuth account unlinked' })
  @ApiResponse({ status: 400, description: 'Cannot unlink only login method' })
  async unlinkOAuth(@Req() req: any, @Body('provider') provider: string) {
    return this.authService.unlinkOAuthAccount(req.user.id, provider);
  }

  /**
   * POST /auth/set-password
   * Set password for OAuth-only users
   */
  @UseGuards(JwtAuthGuard)
  @Post('set-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set password for OAuth-only account' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        new_password: {
          type: 'string',
          example: 'NewPassword@123',
          minLength: 8,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password set successfully' })
  @ApiResponse({ status: 400, description: 'Password already set' })
  async setPassword(@Req() req: any, @Body('new_password') newPassword: string) {
    return this.authService.setPasswordForOAuthUser(req.user.id, newPassword);
  }
}
