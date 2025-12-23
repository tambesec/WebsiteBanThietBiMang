import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/auth.dto';
import { Public } from '../decorators/public.decorator';
import type { Request } from 'express';

/**
 * Admin Auth Controller - Separate endpoints for admin authentication
 * Does NOT use cookies - returns tokens in response body for localStorage
 */
@ApiTags('admin-auth')
@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/admin/login
   * Admin login - returns tokens in JSON (NO cookies)
   * Only allows users with 'admin' role
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login - returns tokens in JSON, no cookies' })
  @ApiResponse({
    status: 200,
    description: 'Admin login successful, tokens in response body',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or not an admin account',
  })
  @ApiResponse({
    status: 403,
    description: 'Account does not have admin privileges',
  })
  async adminLogin(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.login(loginDto, ipAddress, userAgent);

    // SECURITY: Only allow admin role
    if (result.user.role !== 'admin') {
      // Revoke the session immediately
      await this.authService.logout(result.refresh_token, result.user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return tokens in response body (NOT in cookies)
    return {
      message: 'Admin login successful',
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      user: result.user,
    };
  }

  /**
   * POST /auth/admin/refresh
   * Refresh admin access token using refresh token from request body
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh admin access token from request body' })
  @ApiResponse({ status: 200, description: 'New tokens returned' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async adminRefreshToken(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    const result = await this.authService.refreshToken(body.refreshToken);

    // Verify it's still an admin
    const session = await this.authService.getSessionFromRefreshToken(body.refreshToken);
    if (session.user.role !== 'admin') {
      throw new UnauthorizedException('Not an admin account');
    }

    return {
      message: 'Token refreshed successfully',
      accessToken: result.access_token,
    };
  }

  /**
   * POST /auth/admin/logout
   * Admin logout - expects refresh token in body
   */
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin logout - token from request body' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async adminLogout(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      return { message: 'No token provided' };
    }

    try {
      // Get session to extract user_id before revoking
      const session = await this.authService.getSessionFromRefreshToken(body.refreshToken);
      await this.authService.logout(body.refreshToken, session.user.id);
    } catch (error) {
      // Already invalid, that's fine
    }

    return { message: 'Admin logged out successfully' };
  }
}
