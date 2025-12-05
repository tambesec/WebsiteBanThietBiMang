import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @Roles('admin')
  @ApiOperation({ summary: 'Get dashboard overview' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard overview' })
  async getOverview(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getOverview(query.period);
  }

  @Get('revenue-chart')
  @Roles('admin')
  @ApiOperation({ summary: 'Get revenue chart data' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Revenue chart data' })
  async getRevenueChart(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getRevenueChart(query.period);
  }

  @Get('orders-by-status')
  @Roles('admin')
  @ApiOperation({ summary: 'Get orders grouped by status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Orders by status' })
  async getOrdersByStatus() {
    return this.dashboardService.getOrdersByStatus();
  }

  @Get('top-customers')
  @Roles('admin')
  @ApiOperation({ summary: 'Get top customers by spending' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Top customers' })
  async getTopCustomers() {
    return this.dashboardService.getTopCustomers(10);
  }

  @Get('top-products')
  @Roles('admin')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Top selling products' })
  async getTopProducts(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getTopSellingProducts(10, query.period);
  }

  @Get('low-stock')
  @Roles('admin')
  @ApiOperation({ summary: 'Get low stock products' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Low stock products' })
  async getLowStock() {
    return this.dashboardService.getLowStockProducts(10);
  }

  @Get('recent-activities')
  @Roles('admin')
  @ApiOperation({ summary: 'Get recent activities' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Recent activities' })
  async getRecentActivities() {
    return this.dashboardService.getRecentActivities(10);
  }

  @Get('category-performance')
  @Roles('admin')
  @ApiOperation({ summary: 'Get category performance' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category performance' })
  async getCategoryPerformance(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getCategoryPerformance(query.period);
  }
}
