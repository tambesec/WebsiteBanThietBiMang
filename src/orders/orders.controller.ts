import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Create order from cart
   * Protected: Requires authentication
   */
  @Post()
  @ApiOperation({
    summary: 'Create order from cart',
    description:
      'Create a new order from current cart. Validates cart, addresses, stock. Clears cart after successful order.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    schema: {
      example: {
        id: 1,
        order_number: 'ORD-20251205-0001',
        status: {
          id: 1,
          name: 'Pending',
          color: '#FFA500',
        },
        customer: {
          name: 'Nguyễn Văn A',
          email: 'customer@example.com',
          phone: '0901234567',
        },
        total_amount: 560000,
        created_at: '2025-12-05T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cart validation failed or insufficient stock',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  /**
   * Retry payment for pending order
   * Protected: Users can retry payment for their own unpaid orders
   */
  @Post(':id/retry-payment')
  @ApiOperation({
    summary: 'Retry payment for order',
    description:
      'Retry MoMo payment for an unpaid/failed order. Returns new payment URL.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'New payment created',
    schema: {
      example: {
        order: {
          id: 1,
          order_number: 'ORD-20251205-0001',
          status: { id: 1, name: 'Pending' },
          payment_status: 'unpaid',
          total_amount: 560000,
        },
        paymentUrl: 'https://test-payment.momo.vn/...',
        paymentDeeplink: 'momo://...',
        paymentQrCode: 'https://...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Order is already paid or not eligible for retry',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  retryPayment(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.retryPayment(req.user.id, id);
  }

  /**
   * Get all orders for current user
   * Protected: Users see only their orders
   */
  @Get()
  @ApiOperation({
    summary: 'Get all orders',
    description:
      'Get all orders for authenticated user with filters and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    schema: {
      example: {
        orders: [
          {
            id: 1,
            order_number: 'ORD-20251205-0001',
            status: {
              id: 1,
              name: 'Pending',
              color: '#FFA500',
            },
            customer_name: 'Nguyễn Văn A',
            customer_email: 'customer@example.com',
            items_count: 3,
            total_quantity: 5,
            subtotal: 500000,
            shipping_fee: 30000,
            total_amount: 560000,
            payment_method: 'cod',
            payment_status: 'unpaid',
            created_at: '2025-12-05T10:00:00.000Z',
          },
        ],
        pagination: {
          total: 10,
          page: 1,
          limit: 20,
          total_pages: 1,
          has_next_page: false,
          has_prev_page: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  findAll(@Request() req, @Query() query: QueryOrderDto) {
    return this.ordersService.findAll(req.user.id, query, false);
  }

  /**
   * Get all orders (Admin)
   * Protected: Admin only
   */
  @Get('admin/all')
  @Roles('admin')
  @ApiOperation({
    summary: 'Get all orders (Admin)',
    description:
      'Get all orders from all users with filters and pagination. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  findAllAdmin(@Request() req, @Query() query: QueryOrderDto) {
    return this.ordersService.findAll(req.user.id, query, true);
  }

  /**
   * Get order statistics (Admin)
   * Protected: Admin only
   */
  @Get('admin/statistics')
  @Roles('admin')
  @ApiOperation({
    summary: 'Get order statistics (Admin)',
    description:
      'Get order statistics including total orders, revenue, status breakdown. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        total_orders: 150,
        pending_orders: 10,
        processing_orders: 25,
        delivered_orders: 100,
        cancelled_orders: 15,
        total_revenue: 150000000,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  getStatistics() {
    return this.ordersService.getStatistics();
  }

  /**
   * Get order by ID
   * Protected: Validates ownership
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description:
      'Get detailed order information by ID. Validates ownership for customers, admins can view all.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not owner of this order',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const isAdmin = req.user.role === 'admin';
    return this.ordersService.findOne(req.user.id, id, isAdmin);
  }

  /**
   * Get order by order number
   * Protected: Validates ownership
   */
  @Get('number/:orderNumber')
  @ApiOperation({
    summary: 'Get order by order number',
    description:
      'Get detailed order information by order number. Validates ownership for customers.',
  })
  @ApiParam({
    name: 'orderNumber',
    description: 'Order number',
    example: 'ORD-20251205-0001',
  })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not owner of this order',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  findByOrderNumber(@Request() req, @Param('orderNumber') orderNumber: string) {
    const isAdmin = req.user.role === 'admin';
    return this.ordersService.findByOrderNumber(
      req.user.id,
      orderNumber,
      isAdmin,
    );
  }

  /**
   * Update order status (Admin)
   * Protected: Admin only
   */
  @Patch(':id/status')
  @Roles('admin')
  @ApiOperation({
    summary: 'Update order status (Admin)',
    description:
      'Update order status. Validates status transitions, creates history entry. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid status transition',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  updateStatus(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(req.user.id, id, updateStatusDto);
  }

  /**
   * Cancel order (Customer)
   * Protected: Only order owner can cancel
   */
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel order',
    description:
      'Cancel order. Only pending or confirmed orders can be cancelled by customer.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    schema: {
      example: {
        message: 'Order cancelled successfully',
        order_number: 'ORD-20251205-0001',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot cancel at this stage',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not owner of this order',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  cancel(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.cancel(req.user.id, id, reason);
  }
}
