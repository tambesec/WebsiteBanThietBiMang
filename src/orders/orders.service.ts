import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { AddressesService } from '../addresses/addresses.service';
import { MomoService } from '../payments/momo/momo.service';
import { DiscountsService } from '../discounts/discounts.service';
import { CreateOrderDto, PaymentMethod, ShippingMethod } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrderDto, OrderQueryStatus } from './dto/query-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly frontendUrl: string;
  private readonly backendUrl: string;

  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private addressesService: AddressesService,
    private configService: ConfigService,
    private discountsService: DiscountsService,
    @Inject(forwardRef(() => MomoService))
    private momoService: MomoService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    this.backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000';
  }

  /**
   * Create order from cart
   * Security: Validates cart, addresses, stock availability
   */
  async create(userId: number, dto: CreateOrderDto) {
    // Step 1: Validate and get cart
    // Note: validateCart will throw BadRequestException if cart is null/empty
    const cartValidation = await this.cartService.validateCart(
      userId,
      undefined,
    );

    if (!cartValidation.valid) {
      throw new BadRequestException({
        message: 'Cart validation failed',
        errors: cartValidation.errors,
      });
    }

    const cart = cartValidation.cart;

    // Double check (should never reach here if cart is empty due to validateCart logic)
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Step 2: Validate addresses ownership
    await this.addressesService.validateAddressForOrder(
      userId,
      dto.shipping_address_id,
    );

    const billingAddressId =
      dto.billing_address_id || dto.shipping_address_id;
    await this.addressesService.validateAddressForOrder(
      userId,
      billingAddressId,
    );

    // Step 3: Get full address details
    const shippingAddress = await this.prisma.addresses.findUnique({
      where: { id: dto.shipping_address_id },
    });

    const billingAddress = await this.prisma.addresses.findUnique({
      where: { id: billingAddressId },
    });

    if (!shippingAddress || !billingAddress) {
      throw new NotFoundException('Address not found');
    }

    // Step 4: Get user info
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, full_name: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Step 5: Calculate shipping fee
    const shippingFee = this.calculateShippingFee(
      dto.shipping_method,
      cart.summary.subtotal,
    );

    // Step 6: Calculate discount if discount code provided
    const subtotal = cart.summary.subtotal;
    let discountAmount = 0;
    let validatedDiscount: any = null;

    if (dto.discount_code) {
      try {
        validatedDiscount = await this.discountsService.validate(userId, {
          code: dto.discount_code,
          order_amount: subtotal,
        });
        discountAmount = validatedDiscount.discount.discount_amount;
      } catch (error) {
        // If discount validation fails, continue without discount
        this.logger.warn(`Discount code ${dto.discount_code} validation failed: ${error.message}`);
      }
    }

    // Step 7: Calculate totals
    const taxAmount = this.calculateTax(subtotal);
    const totalAmount = subtotal + shippingFee + taxAmount - discountAmount;

    // Step 7: Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    // Step 8: Create order with transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.orders.create({
        data: {
          order_number: orderNumber,
          user_id: userId,
          status_id: 1, // Pending
          customer_name: user.full_name || 'Customer',
          customer_email: user.email,
          customer_phone: dto.customer_phone || shippingAddress.phone,
          shipping_address_id: dto.shipping_address_id,
          billing_address_id: billingAddressId,
          // Shipping address snapshot
          shipping_recipient: shippingAddress.recipient_name,
          shipping_phone: shippingAddress.phone,
          shipping_address: shippingAddress.address_line,
          shipping_city: shippingAddress.city,
          shipping_district: shippingAddress.district,
          shipping_ward: shippingAddress.ward,
          shipping_postal_code: shippingAddress.postal_code,
          // Billing address snapshot
          billing_recipient: billingAddress.recipient_name,
          billing_phone: billingAddress.phone,
          billing_address: billingAddress.address_line,
          billing_city: billingAddress.city,
          billing_district: billingAddress.district,
          billing_ward: billingAddress.ward,
          billing_postal_code: billingAddress.postal_code,
          // Payment & Shipping
          payment_method: dto.payment_method,
          payment_status: 'unpaid',
          shipping_method: dto.shipping_method,
          // Amounts
          subtotal,
          shipping_fee: shippingFee,
          discount_amount: discountAmount,
          discount_code: dto.discount_code,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          customer_note: dto.customer_note,
        },
      });

      // Create order items and reduce stock
      for (const item of cart.items) {
        // Create order item
        await tx.order_items.create({
          data: {
            order_id: newOrder.id,
            product_id: item.product.id,
            product_name: item.product.name,
            product_sku: item.product.slug, // Using slug as SKU
            product_image: item.product.primary_image,
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: item.subtotal,
          },
        });

        // Reduce product stock
        await tx.products.update({
          where: { id: item.product.id },
          data: {
            stock_quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Create order history entry
      await tx.order_history.create({
        data: {
          order_id: newOrder.id,
          status_id: 1,
          note: 'Order created',
          changed_by: userId,
        },
      });

      // Clear cart
      await tx.cart_items.deleteMany({
        where: { cart_id: cart.id },
      });

      return newOrder;
    });

    this.logger.log(`Order ${orderNumber} created for user ${userId}`);

    // Record discount usage if discount was applied
    if (validatedDiscount && discountAmount > 0) {
      try {
        await this.discountsService.applyToOrder(
          userId,
          order.id,
          dto.discount_code!,
          subtotal,
        );
        this.logger.log(`Discount ${dto.discount_code} applied to order ${orderNumber}`);
      } catch (error) {
        // Log but don't fail the order
        this.logger.error(`Failed to record discount usage: ${error.message}`);
      }
    }

    // If payment method is MoMo, create MoMo payment
    if (dto.payment_method === PaymentMethod.MOMO) {
      const momoPayment = await this.createMomoPayment(order, cart, user);
      return {
        ...await this.findOne(userId, order.id),
        paymentUrl: momoPayment.payUrl,
        paymentDeeplink: momoPayment.deeplink,
        paymentQrCode: momoPayment.qrCodeUrl,
      };
    }

    // Return full order details
    return this.findOne(userId, order.id);
  }

  /**
   * Create MoMo payment for order
   */
  private async createMomoPayment(order: any, cart: any, user: any) {
    const ipnUrl = this.configService.get<string>('MOMO_IPN_URL') || 
      `${this.backendUrl}/api/v1/payments/momo/ipn`;
    const redirectUrl = `${this.backendUrl}/api/v1/payments/momo/return`;

    // Prepare items for MoMo
    const items = cart.items.map((item: any) => ({
      id: item.product.id.toString(),
      name: item.product.name,
      description: item.product.name,
      price: Math.round(item.price),
      currency: 'VND',
      quantity: item.quantity,
      totalPrice: Math.round(item.subtotal),
    }));

    // Create MoMo payment request
    const momoResponse = await this.momoService.createPayment({
      orderId: order.order_number,
      orderInfo: `Thanh toán đơn hàng #${order.order_number}`,
      amount: Math.round(Number(order.total_amount)),
      redirectUrl,
      ipnUrl,
      items,
      userInfo: {
        name: user.full_name || 'Khách hàng',
        phoneNumber: order.customer_phone,
        email: user.email,
      },
    });

    return momoResponse;
  }

  /**
   * Retry payment for pending/unpaid order
   * User can retry payment for their own orders that are unpaid
   */
  async retryPayment(userId: number, orderId: number) {
    // Step 1: Find order and verify ownership
    const order = await this.prisma.orders.findFirst({
      where: {
        id: orderId,
        user_id: userId,
      },
      include: {
        order_items: true,
        users: {
          select: { id: true, email: true, full_name: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại hoặc không thuộc về bạn');
    }

    // Step 2: Check if order is eligible for retry payment
    if (order.payment_status !== 'unpaid' && order.payment_status !== 'failed') {
      throw new BadRequestException(
        `Đơn hàng này đã được thanh toán hoặc đang xử lý. Trạng thái: ${order.payment_status}`
      );
    }

    // Only allow retry for MoMo payment method
    if (order.payment_method !== PaymentMethod.MOMO) {
      throw new BadRequestException(
        'Chức năng thanh toán lại chỉ hỗ trợ cho phương thức MoMo'
      );
    }

    // Step 3: Check order status (only pending orders can be retried)
    if (order.status_id > 2) {
      throw new BadRequestException(
        'Không thể thanh toán lại cho đơn hàng đã được xử lý'
      );
    }

    // Step 4: Create new MoMo payment with timestamp to avoid duplicate orderId
    const ipnUrl = this.configService.get<string>('MOMO_IPN_URL') || 
      `${this.backendUrl}/api/v1/payments/momo/ipn`;
    const redirectUrl = `${this.backendUrl}/api/v1/payments/momo/return`;

    // Prepare items for MoMo
    const items = order.order_items.map((item: any) => ({
      id: item.product_id.toString(),
      name: item.product_name,
      description: item.product_name,
      price: Math.round(Number(item.unit_price)),
      currency: 'VND',
      quantity: item.quantity,
      totalPrice: Math.round(Number(item.subtotal)),
    }));

    // Add timestamp suffix to orderId to make it unique
    const retryOrderId = `${order.order_number}_R${Date.now()}`;

    // Create MoMo payment request
    const momoResponse = await this.momoService.createPayment({
      orderId: retryOrderId,
      orderInfo: `Thanh toán lại đơn hàng #${order.order_number}`,
      amount: Math.round(Number(order.total_amount)),
      redirectUrl,
      ipnUrl,
      items,
      userInfo: {
        name: order.users?.full_name || 'Khách hàng',
        phoneNumber: order.customer_phone,
        email: order.users?.email || '',
      },
      extraData: Buffer.from(JSON.stringify({ originalOrderNumber: order.order_number })).toString('base64'),
    });

    this.logger.log(`Retry payment created for order ${order.order_number}: ${retryOrderId}`);

    return {
      order: await this.findOne(userId, order.id),
      paymentUrl: momoResponse.payUrl,
      paymentDeeplink: momoResponse.deeplink,
      paymentQrCode: momoResponse.qrCodeUrl,
    };
  }

  /**
   * Get all orders for user with filters
   * Security: Users see only their own orders, admins see all
   */
  async findAll(userId: number, query: QueryOrderDto, isAdmin: boolean = false) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Security: Non-admin users see only their orders
    if (!isAdmin) {
      where.user_id = userId;
    }

    // Status filter
    if (query.status && query.status !== OrderQueryStatus.ALL) {
      where.status_id = parseInt(query.status);
    }

    // Search filter
    if (query.search) {
      where.OR = [
        { order_number: { contains: query.search } },
        { customer_name: { contains: query.search } },
        { customer_email: { contains: query.search } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    const sortBy = query.sort_by || 'created_at';
    const sortOrder = query.sort_order || 'desc';
    orderBy[sortBy] = sortOrder;

    // Execute queries in parallel
    const [orders, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          order_statuses: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          order_items: {
            select: {
              id: true,
              product_name: true,
              product_image: true,
              quantity: true,
              unit_price: true,
              subtotal: true,
            },
          },
        },
      }),
      this.prisma.orders.count({ where }),
    ]);

    // Format response
    const formattedOrders = orders.map((order) => this.formatOrderSummary(order));

    return {
      orders: formattedOrders,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
        has_next_page: page < Math.ceil(total / limit),
        has_prev_page: page > 1,
      },
    };
  }

  /**
   * Get single order by ID
   * Security: Validates ownership (users) or admin access
   */
  async findOne(userId: number, orderId: number, isAdmin: boolean = false) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        order_statuses: {
          select: {
            id: true,
            name: true,
            color: true,
            description: true,
          },
        },
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                slug: true,
                is_active: true,
              },
            },
          },
        },
        order_history: {
          include: {
            order_statuses: {
              select: {
                name: true,
                color: true,
              },
            },
            users: {
              select: {
                id: true,
                email: true,
                full_name: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Security: Verify ownership for non-admin users
    if (!isAdmin && order.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this order',
      );
    }

    return this.formatOrderDetails(order);
  }

  /**
   * Get order by order number
   * Security: Validates ownership or admin access
   */
  async findByOrderNumber(
    userId: number,
    orderNumber: string,
    isAdmin: boolean = false,
  ) {
    const order = await this.prisma.orders.findUnique({
      where: { order_number: orderNumber },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Security: Verify ownership for non-admin users
    if (!isAdmin && order.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this order',
      );
    }

    return this.findOne(userId, order.id, isAdmin);
  }

  /**
   * Update order status (Admin only)
   * Security: Admin-only operation with history tracking
   */
  async updateStatus(
    adminId: number,
    orderId: number,
    dto: UpdateOrderStatusDto,
  ) {
    // Verify order exists
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transition
    this.validateStatusTransition(order.status_id, dto.status_id);

    // Update order with transaction
    await this.prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {
        status_id: dto.status_id,
        updated_at: new Date(),
        // Update shipped_at for shipped status
        ...(dto.status_id === 4 && !order.shipped_at
          ? { shipped_at: new Date() }
          : {}),
        // Update delivered_at for delivered status
        ...(dto.status_id === 5 && !order.delivered_at
          ? { delivered_at: new Date() }
          : {}),
      };

      // Add optional fields if provided
      if (dto.tracking_number !== undefined) {
        updateData.tracking_number = dto.tracking_number;
      }
      if (dto.payment_status !== undefined) {
        updateData.payment_status = dto.payment_status;
      }
      if (dto.admin_note !== undefined) {
        updateData.admin_note = dto.admin_note;
      }

      // Update order status
      await tx.orders.update({
        where: { id: orderId },
        data: updateData,
      });

      // Create history entry
      await tx.order_history.create({
        data: {
          order_id: orderId,
          status_id: dto.status_id,
          note: dto.note || 'Status updated',
          changed_by: adminId,
        },
      });

      // If cancelled, restore stock
      if (dto.status_id === 6) {
        const orderItems = await tx.order_items.findMany({
          where: { order_id: orderId },
        });

        for (const item of orderItems) {
          await tx.products.update({
            where: { id: item.product_id },
            data: {
              stock_quantity: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    });

    this.logger.log(
      `Order ${order.order_number} status updated to ${dto.status_id} by admin ${adminId}`,
    );

    return this.findOne(order.user_id, orderId, true);
  }

  /**
   * Cancel order (Customer)
   * Security: Only pending/confirmed orders can be cancelled by customer
   */
  async cancel(userId: number, orderId: number, reason?: string) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Security: Verify ownership
    if (order.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to cancel this order',
      );
    }

    // Business rule: Can only cancel pending or confirmed orders
    if (order.status_id > 2) {
      throw new BadRequestException(
        'Order cannot be cancelled at this stage. Please contact support.',
      );
    }

    // Cancel order
    await this.updateStatus(userId, orderId, {
      status_id: 6, // Cancelled
      note: reason || 'Cancelled by customer',
    });

    return {
      message: 'Order cancelled successfully',
      order_number: order.order_number,
    };
  }

  /**
   * Get order statistics (Admin)
   */
  async getStatistics() {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.orders.count(),
      this.prisma.orders.count({ where: { status_id: 1 } }),
      this.prisma.orders.count({ where: { status_id: { in: [2, 3, 4] } } }),
      this.prisma.orders.count({ where: { status_id: 5 } }),
      this.prisma.orders.count({ where: { status_id: 6 } }),
      this.prisma.orders.aggregate({
        _sum: {
          total_amount: true,
        },
        where: {
          status_id: { notIn: [6, 7] }, // Exclude cancelled and returned
        },
      }),
    ]);

    return {
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      processing_orders: processingOrders,
      delivered_orders: deliveredOrders,
      cancelled_orders: cancelledOrders,
      total_revenue: totalRevenue._sum.total_amount || 0,
    };
  }

  /**
   * Private helper: Generate unique order number
   * Format: ORD-YYYYMMDD-HHMMSS-RRR (RRR = random 3 digits)
   */
  private async generateOrderNumber(): Promise<string> {
    const prefix = 'ORD';
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Add random 3 digits to prevent collision
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    
    const orderNumber = `${prefix}-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
    
    // Check if exists (very rare collision)
    const existing = await this.prisma.orders.findUnique({
      where: { order_number: orderNumber },
    });
    
    // If collision happens, retry with new random
    if (existing) {
      await new Promise(resolve => setTimeout(resolve, 10)); // Wait 10ms
      return this.generateOrderNumber();
    }
    
    return orderNumber;
  }

  /**
   * Private helper: Calculate shipping fee
   */
  private calculateShippingFee(method: ShippingMethod, subtotal: number): number {
    // Free shipping for orders over 500,000 VND
    if (subtotal >= 500000) {
      return 0;
    }

    switch (method) {
      case ShippingMethod.STANDARD:
        return 30000;
      case ShippingMethod.EXPRESS:
        return 50000;
      case ShippingMethod.SAME_DAY:
        return 80000;
      default:
        return 30000;
    }
  }

  /**
   * Private helper: Calculate tax (10% VAT)
   */
  private calculateTax(subtotal: number): number {
    return Math.round(subtotal * 0.1);
  }

  /**
   * Private helper: Validate status transition
   */
  private validateStatusTransition(currentStatus: number, newStatus: number) {
    // Cannot go backwards (except to cancelled)
    if (newStatus < currentStatus && newStatus !== 6) {
      throw new BadRequestException('Invalid status transition');
    }

    // Cannot change from delivered
    if (currentStatus === 5 && newStatus !== 7) {
      throw new BadRequestException('Cannot change status of delivered order');
    }

    // Cannot change from cancelled
    if (currentStatus === 6) {
      throw new BadRequestException('Cannot change status of cancelled order');
    }
  }

  /**
   * Private helper: Format order summary
   */
  private formatOrderSummary(order: any) {
    return {
      id: order.id,
      order_number: order.order_number,
      status: {
        id: order.order_statuses.id,
        name: order.order_statuses.name,
        color: order.order_statuses.color,
      },
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      items_count: order.order_items.length,
      total_quantity: order.order_items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
      subtotal: Number(order.subtotal),
      shipping_fee: Number(order.shipping_fee),
      total_amount: Number(order.total_amount),
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      created_at: order.created_at,
      updated_at: order.updated_at,
    };
  }

  /**
   * Private helper: Format order details
   */
  private formatOrderDetails(order: any) {
    return {
      id: order.id,
      order_number: order.order_number,
      status: {
        id: order.order_statuses.id,
        name: order.order_statuses.name,
        color: order.order_statuses.color,
        description: order.order_statuses.description,
      },
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
      },
      shipping_address: {
        recipient: order.shipping_recipient,
        phone: order.shipping_phone,
        address: order.shipping_address,
        ward: order.shipping_ward,
        district: order.shipping_district,
        city: order.shipping_city,
        postal_code: order.shipping_postal_code,
        full_address: this.formatFullAddress({
          address: order.shipping_address,
          ward: order.shipping_ward,
          district: order.shipping_district,
          city: order.shipping_city,
          postal_code: order.shipping_postal_code,
        }),
      },
      billing_address: {
        recipient: order.billing_recipient,
        phone: order.billing_phone,
        address: order.billing_address,
        ward: order.billing_ward,
        district: order.billing_district,
        city: order.billing_city,
        postal_code: order.billing_postal_code,
        full_address: this.formatFullAddress({
          address: order.billing_address,
          ward: order.billing_ward,
          district: order.billing_district,
          city: order.billing_city,
          postal_code: order.billing_postal_code,
        }),
      },
      items: order.order_items.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        product_image: item.product_image,
        product_slug: item.products?.slug,
        product_available: item.products?.is_active === 1,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        subtotal: Number(item.subtotal),
      })),
      payment: {
        method: order.payment_method,
        status: order.payment_status,
        paid_at: order.paid_at,
      },
      shipping: {
        method: order.shipping_method,
        tracking_number: order.tracking_number,
        shipped_at: order.shipped_at,
        delivered_at: order.delivered_at,
      },
      amounts: {
        subtotal: Number(order.subtotal),
        shipping_fee: Number(order.shipping_fee),
        discount_amount: Number(order.discount_amount),
        discount_code: order.discount_code,
        tax_amount: Number(order.tax_amount),
        total_amount: Number(order.total_amount),
      },
      notes: {
        customer_note: order.customer_note,
        admin_note: order.admin_note,
      },
      history: order.order_history.map((h) => ({
        status: {
          id: h.status_id,
          name: h.order_statuses.name,
          color: h.order_statuses.color,
        },
        note: h.note,
        changed_by: {
          id: h.users.id,
          email: h.users.email,
          full_name: h.users.full_name,
        },
        created_at: h.created_at,
      })),
      created_at: order.created_at,
      updated_at: order.updated_at,
    };
  }

  /**
   * Private helper: Format full address
   */
  private formatFullAddress(address: any): string {
    const parts = [address.address];
    if (address.ward) parts.push(address.ward);
    if (address.district) parts.push(address.district);
    parts.push(address.city);
    if (address.postal_code) parts.push(address.postal_code);
    return parts.join(', ');
  }
}
