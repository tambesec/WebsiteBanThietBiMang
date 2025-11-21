import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
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
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';

@ApiTags('Orders')
@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Create order from cart
   * Security: JWT required, transaction-based, validates all resources
   */
  @Post()
  @ApiOperation({ summary: 'Create order from cart' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or cart empty' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, createOrderDto);
  }

  /**
   * Get user's orders
   * Security: JWT required, user can only see their own orders
   */
  @Get('my-orders')
  @ApiOperation({ summary: 'Get my orders' })
  @ApiQuery({ type: OrderQueryDto })
  @ApiResponse({ status: 200, description: 'Returns user orders' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyOrders(@Req() req: any, @Query() query: OrderQueryDto) {
    return this.ordersService.findUserOrders(req.user.userId, query);
  }

  /**
   * Get all orders (admin only)
   * Security: JWT required, admin role required
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  @ApiQuery({ type: OrderQueryDto })
  @ApiResponse({ status: 200, description: 'Returns all orders' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  /**
   * Get order by ID
   * Security: Users see only their orders, admins see all
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiResponse({ status: 200, description: 'Returns order details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const isAdmin = req.user.roles?.includes('admin') || false;
    return this.ordersService.findOne(id, req.user.userId, isAdmin);
  }

  /**
   * Update order status (admin only)
   * Security: JWT required, admin role, creates audit trail
   */
  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update order status (admin only)' })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateDto, req.user.userId);
  }
}
