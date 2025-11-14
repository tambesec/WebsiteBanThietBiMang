import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create order from cart
   * Security: Transaction ensures data consistency, validates all resources
   */
  async create(userId: number, createOrderDto: CreateOrderDto) {
    const {
      shippingAddressId,
      billingAddressId,
      paymentMethodId,
      shippingMethodId,
      discountCode,
      customerNote,
    } = createOrderDto;

    // Use transaction for data consistency
    return this.prisma.$transaction(async (tx) => {
      // 1. Get user's cart with items
      const cart = await tx.shoppingCart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              productItem: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // 2. Validate all resources exist and user has access
      const [shippingAddress, billingAddress, paymentMethod, shippingMethod] = await Promise.all([
        this.validateUserAddress(tx, userId, shippingAddressId),
        this.validateUserAddress(tx, userId, billingAddressId),
        this.validateUserPayment(tx, userId, paymentMethodId),
        tx.shippingMethod.findUnique({ where: { id: shippingMethodId } }),
      ]);

      if (!shippingMethod || !shippingMethod.isActive) {
        throw new BadRequestException('Invalid shipping method');
      }

      // 3. Validate stock and calculate totals
      let subtotal = 0;
      for (const item of cart.items) {
        if (item.productItem.qtyInStock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${item.productItem.product.name}. Available: ${item.productItem.qtyInStock}`,
          );
        }
        if (!item.productItem.isActive || !item.productItem.product.isActive) {
          throw new BadRequestException(`Product ${item.productItem.product.name} is no longer available`);
        }
        subtotal += Number(item.productItem.price) * item.quantity;
      }

      // 4. Apply discount if provided
      let discount = null;
      let discountAmount = 0;

      if (discountCode) {
        discount = await this.validateDiscount(tx, discountCode, subtotal);
        if (discount) {
          if (discount.discountType === 'percentage') {
            discountAmount = (subtotal * Number(discount.discountValue)) / 100;
          } else {
            discountAmount = Number(discount.discountValue);
          }
        }
      }

      // 5. Calculate shipping fee
      const totalWeight = cart.items.reduce((sum, item) => {
        return sum + (Number(item.productItem.weightKg) || 0) * item.quantity;
      }, 0);

      const shippingFee =
        Number(shippingMethod.basePrice) +
        (shippingMethod.pricePerKg ? Number(shippingMethod.pricePerKg) * totalWeight : 0);

      const totalAmount = subtotal - discountAmount + shippingFee;

      // 6. Generate unique order number
      const orderNumber = await this.generateOrderNumber(tx);

      // 7. Get default order status (e.g., "Pending")
      const defaultStatus = await tx.orderStatus.findFirst({
        where: { name: 'Pending' },
      });

      if (!defaultStatus) {
        throw new BadRequestException('Order status not configured');
      }

      // 8. Create order
      const order = await tx.shopOrder.create({
        data: {
          orderNumber,
          userId,
          shippingAddressId,
          billingAddressId,
          paymentMethodId,
          shippingMethodId,
          discountId: discount?.id,
          statusId: defaultStatus.id,
          subtotal,
          discountAmount,
          shippingFee,
          totalAmount,
          customerNote,
          orderedAt: new Date(),
          items: {
            create: cart.items.map((item) => ({
              productItemId: item.productItemId,
              productName: item.productItem.product.name,
              sku: item.productItem.sku,
              quantity: item.quantity,
              unitPrice: item.productItem.price,
              subtotal: Number(item.productItem.price) * item.quantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              productItem: true,
            },
          },
          status: true,
          shippingAddress: true,
          billingAddress: true,
        },
      });

      // 9. Update stock quantities
      for (const item of cart.items) {
        await tx.productItem.update({
          where: { id: item.productItemId },
          data: {
            qtyInStock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 10. Update discount usage if applied
      if (discount) {
        await tx.discount.update({
          where: { id: discount.id },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      // 11. Create order status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          statusId: defaultStatus.id,
          note: 'Order created',
          createdBy: userId,
        },
      });

      // 12. Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });
  }

  /**
   * Get user orders with pagination
   * Security: User can only see their own orders
   */
  async findUserOrders(userId: number, query: OrderQueryDto) {
    const { page, limit, statusId, orderNumber } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ShopOrderWhereInput = {
      userId,
      ...(statusId && { statusId }),
      ...(orderNumber && {
        orderNumber: {
          contains: orderNumber,
        },
      }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.shopOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          status: true,
          items: {
            include: {
              productItem: {
                include: {
                  product: {
                    select: {
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.shopOrder.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all orders (admin only)
   * Security: Only accessible by admin role
   */
  async findAll(query: OrderQueryDto) {
    const { page, limit, statusId, orderNumber } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ShopOrderWhereInput = {
      ...(statusId && { statusId }),
      ...(orderNumber && {
        orderNumber: {
          contains: orderNumber,
        },
      }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.shopOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          status: true,
          items: true,
        },
      }),
      this.prisma.shopOrder.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get order by ID
   * Security: Users can only view their own orders, admins can view all
   */
  async findOne(orderId: number, userId: number, isAdmin: boolean = false) {
    const order = await this.prisma.shopOrder.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
          },
        },
        status: true,
        shippingAddress: true,
        billingAddress: true,
        paymentMethod: {
          include: {
            paymentMethod: true,
          },
        },
        shippingMethod: true,
        discount: true,
        items: {
          include: {
            productItem: {
              include: {
                product: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            status: true,
            creator: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Security: Non-admin users can only view their own orders
    if (!isAdmin && order.userId !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  /**
   * Update order status (admin only)
   * Security: Validates status exists, creates audit trail
   */
  async updateStatus(orderId: number, updateDto: UpdateOrderStatusDto, adminId: number) {
    const { statusId, note } = updateDto;

    // Verify order exists
    const order = await this.prisma.shopOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify status exists
    const status = await this.prisma.orderStatus.findUnique({
      where: { id: statusId },
    });

    if (!status) {
      throw new BadRequestException('Invalid status');
    }

    // Update order status with audit trail
    const [updatedOrder] = await Promise.all([
      this.prisma.shopOrder.update({
        where: { id: orderId },
        data: { statusId },
        include: {
          status: true,
        },
      }),
      this.prisma.orderStatusHistory.create({
        data: {
          orderId,
          statusId,
          note: note || `Status changed to ${status.name}`,
          createdBy: adminId,
        },
      }),
    ]);

    return updatedOrder;
  }

  /**
   * Validate user has access to address
   * Private helper method
   */
  private async validateUserAddress(tx: any, userId: number, addressId: number) {
    const userAddress = await tx.userAddress.findFirst({
      where: {
        userId,
        addressId,
      },
      include: {
        address: true,
      },
    });

    if (!userAddress) {
      throw new BadRequestException('Invalid address');
    }

    return userAddress.address;
  }

  /**
   * Validate user has access to payment method
   * Private helper method
   */
  private async validateUserPayment(tx: any, userId: number, paymentMethodId: number) {
    const userPayment = await tx.userPayment.findFirst({
      where: {
        id: paymentMethodId,
        userId,
      },
    });

    if (!userPayment) {
      throw new BadRequestException('Invalid payment method');
    }

    return userPayment;
  }

  /**
   * Validate discount code
   * Private helper method
   */
  private async validateDiscount(tx: any, code: string, orderAmount: number) {
    const discount = await tx.discount.findUnique({
      where: { code },
    });

    if (!discount || !discount.isActive) {
      throw new BadRequestException('Invalid discount code');
    }

    const now = new Date();
    if (discount.startsAt > now || discount.endsAt < now) {
      throw new BadRequestException('Discount code has expired');
    }

    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      throw new BadRequestException('Discount code usage limit reached');
    }

    if (discount.minOrderAmount && orderAmount < Number(discount.minOrderAmount)) {
      throw new BadRequestException(
        `Minimum order amount for this discount is ${discount.minOrderAmount}`,
      );
    }

    return discount;
  }

  /**
   * Generate unique order number
   * Private helper method
   */
  private async generateOrderNumber(tx: any): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Count orders today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const todayOrderCount = await tx.shopOrder.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = String(todayOrderCount + 1).padStart(4, '0');
    return `ORD-${year}${month}${day}-${sequence}`;
  }
}
