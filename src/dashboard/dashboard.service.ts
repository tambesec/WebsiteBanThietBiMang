import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get overview statistics
   */
  async getOverview(period: string = 'month') {
    const dateRange = this.getDateRange(period);

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      // Total revenue
      this.prisma.orders.aggregate({
        where: {
          status_id: { notIn: [6, 7] }, // Exclude cancelled/returned
          created_at: dateRange,
        },
        _sum: { total_amount: true },
      }),

      // Total orders
      this.prisma.orders.count({
        where: { created_at: dateRange },
      }),

      // Total customers
      this.prisma.users.count({
        where: {
          role: 'customer',
          created_at: dateRange,
        },
      }),

      // Total products
      this.prisma.products.count({
        where: { is_active: 1 },
      }),

      // Pending orders
      this.prisma.orders.count({
        where: {
          status_id: 1,
          created_at: dateRange,
        },
      }),

      // Low stock products (< 10)
      this.prisma.products.count({
        where: {
          is_active: 1,
          stock_quantity: { lt: 10 },
        },
      }),

      // Recent orders
      this.prisma.orders.count({
        where: {
          created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),

      // Top selling products
      this.prisma.order_items.groupBy({
        by: ['product_id'],
        where: {
          orders: { created_at: dateRange },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      period,
      revenue: {
        total: Number(totalRevenue._sum.total_amount || 0),
        orders_count: totalOrders,
      },
      customers: {
        total: totalCustomers,
      },
      products: {
        total: totalProducts,
        low_stock: lowStockProducts,
      },
      orders: {
        pending: pendingOrders,
        recent_24h: recentOrders,
      },
      top_products: await this.enrichTopProducts(topProducts),
    };
  }

  /**
   * Get revenue chart data
   */
  async getRevenueChart(period: string = 'month') {
    const dateRange = this.getDateRange(period);
    const groupBy = this.getGroupByFormat(period);

    const revenue = await this.prisma.$queryRaw<any[]>`
      SELECT 
        DATE_FORMAT(created_at, ${groupBy}) as date,
        COUNT(*) as orders_count,
        SUM(total_amount) as revenue
      FROM orders
      WHERE created_at >= ${dateRange.gte}
        AND status_id NOT IN (6, 7)
      GROUP BY date
      ORDER BY date ASC
    `;

    return revenue.map((r) => ({
      date: r.date,
      orders: Number(r.orders_count),
      revenue: Number(r.revenue),
    }));
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus() {
    const statuses = await this.prisma.order_statuses.findMany({
      orderBy: { display_order: 'asc' },
    });

    const counts = await Promise.all(
      statuses.map((status) =>
        this.prisma.orders.count({
          where: { status_id: status.id },
        }),
      ),
    );

    return statuses.map((status, index) => ({
      status: status.name,
      color: status.color,
      count: counts[index],
    }));
  }

  /**
   * Get top customers
   */
  async getTopCustomers(limit = 10) {
    const customers = await this.prisma.$queryRaw<any[]>`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        COUNT(DISTINCT o.id) as total_orders,
        SUM(o.total_amount) as total_spent
      FROM users u
      JOIN orders o ON u.id = o.user_id
      WHERE o.status_id NOT IN (6, 7)
      GROUP BY u.id, u.full_name, u.email
      ORDER BY total_spent DESC
      LIMIT ${limit}
    `;

    return customers.map((c) => ({
      id: c.id,
      name: c.full_name,
      email: c.email,
      total_orders: Number(c.total_orders),
      total_spent: Number(c.total_spent),
    }));
  }

  /**
   * Get top selling products
   */
  async getTopSellingProducts(limit = 10, period: string = 'month') {
    const dateRange = this.getDateRange(period);

    const products = await this.prisma.$queryRaw<any[]>`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.primary_image,
        p.price,
        p.stock_quantity,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= ${dateRange.gte}
        AND o.status_id NOT IN (6, 7)
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT ${limit}
    `;

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.primary_image,
      price: Number(p.price),
      stock: p.stock_quantity,
      sold: Number(p.total_sold),
      revenue: Number(p.total_revenue),
    }));
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(threshold = 10) {
    const products = await this.prisma.products.findMany({
      where: {
        is_active: 1,
        stock_quantity: { lt: threshold },
      },
      orderBy: { stock_quantity: 'asc' },
      take: 20,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        stock_quantity: true,
        primary_image: true,
        categories: {
          select: { name: true },
        },
      },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      stock: p.stock_quantity,
      image: p.primary_image,
      category: p.categories.name,
    }));
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit = 10) {
    const [recentOrders, recentReviews, recentUsers] = await Promise.all([
      this.prisma.orders.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          order_number: true,
          customer_name: true,
          total_amount: true,
          created_at: true,
          order_statuses: { select: { name: true } },
        },
      }),

      this.prisma.product_reviews.findMany({
        take: 5,
        where: { is_approved: 0 },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          rating: true,
          created_at: true,
          users: { select: { full_name: true } },
          products: { select: { name: true } },
        },
      }),

      this.prisma.users.findMany({
        take: 5,
        where: { role: 'customer' },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          full_name: true,
          email: true,
          created_at: true,
        },
      }),
    ]);

    const activities = [
      ...recentOrders.map((o) => ({
        type: 'order',
        title: `New order ${o.order_number}`,
        description: `${o.customer_name} - ${Number(o.total_amount).toLocaleString()} VND`,
        timestamp: o.created_at,
      })),
      ...recentReviews.map((r) => ({
        type: 'review',
        title: `New review (${r.rating}⭐)`,
        description: `${r.users.full_name} reviewed ${r.products.name}`,
        timestamp: r.created_at,
      })),
      ...recentUsers.map((u) => ({
        type: 'user',
        title: 'New customer',
        description: `${u.full_name} (${u.email})`,
        timestamp: u.created_at,
      })),
    ];

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get category performance
   */
  async getCategoryPerformance(period: string = 'month') {
    const dateRange = this.getDateRange(period);

    const categories = await this.prisma.$queryRaw<any[]>`
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT oi.order_id) as orders_count,
        SUM(oi.quantity) as items_sold,
        SUM(oi.subtotal) as revenue
      FROM categories c
      JOIN products p ON c.id = p.category_id
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= ${dateRange.gte}
        AND o.status_id NOT IN (6, 7)
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
    `;

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      orders: Number(c.orders_count),
      items_sold: Number(c.items_sold),
      revenue: Number(c.revenue),
    }));
  }

  /**
   * Helper: Get date range for period
   */
  private getDateRange(period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    return { gte: startDate };
  }

  /**
   * Helper: Get group by format for charts
   */
  private getGroupByFormat(period: string): string {
    switch (period) {
      case 'today':
      case 'week':
        return '%Y-%m-%d';
      case 'month':
        return '%Y-%m-%d';
      case 'year':
        return '%Y-%m';
      default:
        return '%Y-%m-%d';
    }
  }

  /**
   * Helper: Enrich top products with details
   */
  private async enrichTopProducts(topProducts: any[]) {
    if (topProducts.length === 0) return [];

    const productIds = topProducts.map((p) => p.product_id);
    const products = await this.prisma.products.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        primary_image: true,
        price: true,
      },
    });

    return topProducts.map((tp) => {
      const product = products.find((p) => p.id === tp.product_id);
      return {
        id: product?.id,
        name: product?.name,
        slug: product?.slug,
        image: product?.primary_image,
        price: Number(product?.price || 0),
        sold: Number(tp._sum.quantity || 0),
      };
    });
  }
}
