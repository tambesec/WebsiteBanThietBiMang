import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
  Res,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, LogoutDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import type { Request, Response } from 'express';

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
   * Register a new user account
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   * Login with email and password
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful, returns access and refresh tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or account locked' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'New access token generated' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  /**
   * POST /auth/logout
   * Logout and invalidate refresh token
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and invalidate session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Body() logoutDto: LogoutDto, @Req() req: any) {
    return this.authService.logout(logoutDto.refresh_token, req.user.sub);
  }

  /**
   * GET /auth/profile
   * Get current user profile (requires authentication)
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.sub);
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
  @ApiResponse({ status: 400, description: 'Current password incorrect or password reused' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: any) {
    return this.authService.changePassword(
      req.user.sub,
      changePasswordDto.current_password,
      changePasswordDto.new_password,
    );
  }

  // ==================== OAuth2 Google Endpoints ====================

  /**
   * GET /auth/google
   * Initiate Google OAuth2 authentication
   * Redirects user to Google consent screen
   */
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ 
    summary: 'Login with Google OAuth2',
    description: 'Redirects to Google authentication page. User will be redirected back to callback URL after authentication.'
  })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth consent screen' })
  @ApiExcludeEndpoint() // Hide from Swagger as it redirects
  async googleAuth() {
    // Guard handles the redirect to Google
  }

  /**
   * GET /auth/google/callback
   * Google OAuth2 callback handler
   * Security: Validates state parameter, generates JWT tokens
   */
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ 
    summary: 'Google OAuth2 callback',
    description: 'Handles callback from Google OAuth. Generates JWT tokens and redirects to frontend.'
  })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with tokens' })
  @ApiResponse({ status: 401, description: 'OAuth authentication failed' })
  @ApiExcludeEndpoint() // Hide from Swagger as it's callback
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const user = req.user;

      // Generate JWT tokens for the user
      const tokens = await this.authService.generateOAuthTokens(user);

      // Security: Redirect to frontend with tokens in secure way
      // Option 1: Set httpOnly cookies (recommended for production)
      res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Option 2: Redirect with tokens in URL (less secure, use only for development)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      // Redirect to frontend error page
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }

  /**
   * DELETE /auth/oauth/:provider
   * Unlink OAuth provider from account
   * Security: Ensures user has alternative login method
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Delete('oauth/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Unlink OAuth provider',
    description: 'Remove OAuth provider connection from user account. Requires password or another OAuth provider.'
  })
  @ApiResponse({ status: 200, description: 'OAuth provider unlinked successfully' })
  @ApiResponse({ status: 400, description: 'Cannot unlink the only login method' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unlinkOAuthProvider(@Param('provider') provider: string, @Req() req: any) {
    return this.authService.unlinkOAuthProvider(req.user.sub, provider);
  }

  /**
   * GET /auth/oauth/accounts
   * Get list of linked OAuth accounts
   */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('oauth/accounts')
  @ApiOperation({ 
    summary: 'Get linked OAuth accounts',
    description: 'Returns list of OAuth providers connected to user account'
  })
  @ApiResponse({ status: 200, description: 'OAuth accounts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOAuthAccounts(@Req() req: any) {
    return this.authService.getOAuthAccounts(req.user.sub);
  }
}
