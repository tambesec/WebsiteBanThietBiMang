import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';

@ApiTags('Admin')
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get dashboard statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Returns dashboard stats' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  /**
   * Get revenue report
   */
  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Returns revenue report' })
  async getRevenueReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.adminService.getRevenueReport(start, end);
  }

  /**
   * Get all users
   */
  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Returns paginated users' })
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(page, limit, search);
  }

  /**
   * Get all orders
   */
  @Get('orders')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Returns paginated orders' })
  async getAllOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllOrders(page, limit, status, search);
  }

  /**
   * Update order status
   */
  @Put('orders/:id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Body('note') note?: string,
  ) {
    return this.adminService.updateOrderStatus(id, status, note);
  }

  /**
   * Toggle user active status
   */
  @Put('users/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle user active status' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User status toggled' })
  async toggleUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.adminService.toggleUserStatus(id, req.user.sub);
  }

  /**
   * Get product reviews for approval
   */
  @Get('reviews')
  @ApiOperation({ summary: 'Get product reviews' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'isApproved', required: false })
  @ApiResponse({ status: 200, description: 'Returns paginated reviews' })
  async getReviews(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isApproved') isApproved?: boolean,
  ) {
    return this.adminService.getReviews(page, limit, isApproved);
  }

  /**
   * Approve/reject review
   */
  @Put('reviews/:id/status')
  @ApiOperation({ summary: 'Update review approval status' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review status updated' })
  async updateReviewStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isApproved') isApproved: boolean,
  ) {
    return this.adminService.updateReviewStatus(id, isApproved);
  }
}
