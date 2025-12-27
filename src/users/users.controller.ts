import { Controller, Get, Patch, Body, UseGuards, Req, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/admin/profile
   * Get current admin profile (requires admin authentication)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @Get('admin/profile')
  @ApiOperation({ 
    summary: 'Get admin profile',
    description: 'Retrieve current admin user profile information. Requires admin role.'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin user' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async getAdminProfile(@Req() req: any) {
    return this.usersService.getAdminProfile(req.user.id);
  }

  /**
   * PATCH /users/admin/profile
   * Update admin profile (requires admin authentication)
   * SECURITY: Only allows updating full_name and phone
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @Patch('admin/profile')
  @ApiOperation({ 
    summary: 'Update admin profile',
    description: 'Update current admin profile. Only full_name and phone can be updated. Email, role, and account status cannot be changed for security reasons.'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin profile updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin user' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Account inactive or invalid operation' })
  async updateAdminProfile(
    @Body() updateAdminProfileDto: UpdateAdminProfileDto,
    @Req() req: any,
  ) {
    return this.usersService.updateAdminProfile(req.user.id, updateAdminProfileDto);
  }

  /**
   * GET /users
   * Get all users (customers) with pagination and filters
   * ADMIN ONLY
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve paginated list of users with filters. Admin only.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
  @ApiQuery({ name: 'role', required: false, enum: ['all', 'admin', 'customer'] })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'inactive'] })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  async getAllUsers(@Query() query: QueryUsersDto) {
    return this.usersService.getAllUsers(query);
  }

  /**
   * GET /users/statistics
   * Get users statistics
   * ADMIN ONLY
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @Get('statistics')
  @ApiOperation({
    summary: 'Get users statistics',
    description: 'Retrieve statistics about users (total, active, new users, etc.). Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  async getUsersStatistics() {
    return this.usersService.getUsersStatistics();
  }

  /**
   * GET /users/:id
   * Get user detail by ID
   * ADMIN ONLY
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve detailed information about a specific user. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  /**
   * PATCH /users/:id/status
   * Update user status (block/unblock)
   * ADMIN ONLY - Cannot modify other admins
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update user status',
    description: 'Block or unblock a user account. Cannot modify admin accounts. Admin only.',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot modify admin accounts or self' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateUserStatusDto,
    @Req() req: any,
  ) {
    return this.usersService.updateUserStatus(id, updateStatusDto, req.user.id);
  }
}
