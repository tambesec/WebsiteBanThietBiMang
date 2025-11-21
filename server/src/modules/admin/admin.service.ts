import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get dashboard statistics
   * Security: Admin only
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      // Total users
      this.prisma.siteUser.count({
        where: { isActive: true },
      }),

      // Total products
      this.prisma.product.count({
        where: { isActive: true },
      }),

      // Total orders
      this.prisma.shopOrder.count(),

      // Pending orders
      this.prisma.shopOrder.count({
        where: {
          status: {
            name: { in: ['pending', 'processing'] },
          },
        },
      }),

      // Total revenue
      this.prisma.shopOrder.aggregate({
        where: {
          status: {
            name: { in: ['delivered', 'completed'] },
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Recent orders (last 10)
      this.prisma.shopOrder.findMany({
        take: 10,
        orderBy: { orderedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          shippingAddress: true,
        },
      }),

      // Top selling products
      this.prisma.orderItem.groupBy({
        by: ['productItemId'],
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const productItem = await this.prisma.productItem.findUnique({
          where: { id: item.productItemId },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                brand: true,
              },
            },
          },
        });

        return {
          product: productItem?.product,
          totalSold: item._sum.quantity || 0,
        };
      }),
    );

    // Calculate growth percentages (comparing with last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [lastMonthOrders, lastMonthRevenue] = await Promise.all([
      this.prisma.shopOrder.count({
        where: {
          orderedAt: {
            gte: lastMonth,
          },
        },
      }),
      this.prisma.shopOrder.aggregate({
        where: {
          orderedAt: {
            gte: lastMonth,
          },
          status: {
            name: { in: ['delivered', 'completed'] },
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      recentOrders,
      topProducts: topProductsWithDetails,
      growth: {
        orders: lastMonthOrders,
        revenue: Number(lastMonthRevenue._sum.totalAmount || 0),
      },
    };
  }

  /**
   * Get revenue report
   * Security: Admin only
   */
  async getRevenueReport(startDate?: Date, endDate?: Date) {
    const where: any = {
      status: {
        name: { in: ['delivered', 'completed'] },
      },
    };

    if (startDate || endDate) {
      where.orderedAt = {};
      if (startDate) where.orderedAt.gte = startDate;
      if (endDate) where.orderedAt.lte = endDate;
    }

    const [revenue, orders] = await Promise.all([
      this.prisma.shopOrder.aggregate({
        where,
        _sum: {
          totalAmount: true,
        },
        _avg: {
          totalAmount: true,
        },
        _count: true,
      }),
      this.prisma.shopOrder.findMany({
        where,
        select: {
          id: true,
          orderedAt: true,
          totalAmount: true,
        },
        orderBy: { orderedAt: 'desc' },
      }),
    ]);

    // Group by date
    const dailyRevenue = orders.reduce((acc: any, order) => {
      const date = order.orderedAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          revenue: 0,
          orders: 0,
        };
      }
      acc[date].revenue += Number(order.totalAmount);
      acc[date].orders += 1;
      return acc;
    }, {});

    return {
      totalRevenue: Number(revenue._sum.totalAmount || 0),
      averageOrderValue: Number(revenue._avg.totalAmount || 0),
      totalOrders: revenue._count,
      dailyRevenue: Object.values(dailyRevenue),
    };
  }

  /**
   * Get all users with pagination
   * Security: Admin only
   */
  async getAllUsers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.siteUser.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.siteUser.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        ...user,
        roles: user.roles.map((ur) => ur.role.name),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all orders with pagination and filters
   * Security: Admin only
   */
  async getAllOrders(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = {
        name: status,
      };
    }
    if (search) {
      where.OR = [
        { user: { username: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.shopOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          shippingAddress: true,
          status: true,
          items: {
            include: {
              productItem: {
                include: {
                  product: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { orderedAt: 'desc' },
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
   * Update order status
   * Security: Admin only
   */
  async updateOrderStatus(orderId: number, statusName: string, note?: string) {
    // Find status ID by name
    const status = await this.prisma.orderStatus.findFirst({
      where: { name: statusName },
    });

    if (!status) {
      throw new Error('Invalid order status');
    }

    // Note: OrderStatusHistory requires createdBy, skipping history for now
    // Or you would need to pass userId from controller
    
    // Update order
    return this.prisma.shopOrder.update({
      where: { id: orderId },
      data: { statusId: status.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        status: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Toggle user active status
   * Security: Admin only, cannot deactivate self
   */
  async toggleUserStatus(userId: number, adminId: number) {
    if (userId === adminId) {
      throw new Error('Cannot deactivate your own account');
    }

    const user = await this.prisma.siteUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.prisma.siteUser.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }

  /**
   * Get product reviews (for approval)
   * Security: Admin only
   */
  async getReviews(page: number = 1, limit: number = 20, isApproved?: boolean) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isApproved !== undefined) {
      where.isApproved = isApproved;
    }

    const [reviews, total] = await Promise.all([
      this.prisma.productReview.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.productReview.count({ where }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approve/reject review
   * Security: Admin only
   */
  async updateReviewStatus(reviewId: number, isApproved: boolean) {
    return this.prisma.productReview.update({
      where: { id: reviewId },
      data: { isApproved },
    });
  }
}
