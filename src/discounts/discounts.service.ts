import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ValidateDiscountDto } from './dto/validate-discount.dto';
import { discount_codes_discount_type } from '@prisma/client';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create discount code (Admin only)
   */
  async create(createDiscountDto: CreateDiscountDto) {
    const { code, starts_at, ends_at, ...rest } = createDiscountDto;

    // Check if code already exists
    const existing = await this.prisma.discount_codes.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException('Discount code already exists');
    }

    // Validate dates
    const startDate = new Date(starts_at);
    const endDate = new Date(ends_at);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const discount = await this.prisma.discount_codes.create({
      data: {
        code: code.toUpperCase(),
        starts_at: startDate,
        ends_at: endDate,
        discount_type: rest.discount_type as discount_codes_discount_type,
        discount_value: rest.discount_value,
        description: rest.description,
        min_order_amount: rest.min_order_amount,
        max_discount_amount: rest.max_discount_amount,
        max_uses: rest.max_uses,
        max_uses_per_user: rest.max_uses_per_user,
      },
    });

    return {
      message: 'Discount code created successfully',
      discount: this.formatDiscount(discount),
    };
  }

  /**
   * Get all discount codes (Admin)
   */
  async findAll(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status === 'active') {
      where.is_active = 1;
      where.ends_at = { gte: new Date() };
    } else if (status === 'expired') {
      where.ends_at = { lt: new Date() };
    } else if (status === 'inactive') {
      where.is_active = 0;
    }

    const [discounts, total] = await Promise.all([
      this.prisma.discount_codes.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          _count: {
            select: { discount_usage: true },
          },
        },
      }),
      this.prisma.discount_codes.count({ where }),
    ]);

    return {
      discounts: discounts.map((d) => this.formatDiscount(d)),
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get discount by ID (Admin)
   */
  async findOne(id: number) {
    const discount = await this.prisma.discount_codes.findUnique({
      where: { id },
      include: {
        discount_usage: {
          include: {
            users: { select: { email: true, full_name: true } },
            orders: { select: { order_number: true } },
          },
          orderBy: { used_at: 'desc' },
          take: 10,
        },
        _count: { select: { discount_usage: true } },
      },
    });

    if (!discount) {
      throw new NotFoundException('Discount code not found');
    }

    return this.formatDiscount(discount);
  }

  /**
   * Update discount code (Admin)
   */
  async update(id: number, updateDiscountDto: UpdateDiscountDto) {
    const discount = await this.prisma.discount_codes.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException('Discount code not found');
    }

    const { starts_at, ends_at, ...rest } = updateDiscountDto;
    const updateData: any = { ...rest };

    if (starts_at) updateData.starts_at = new Date(starts_at);
    if (ends_at) updateData.ends_at = new Date(ends_at);

    // Validate dates if both provided
    if (updateData.starts_at && updateData.ends_at) {
      if (updateData.ends_at <= updateData.starts_at) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const updated = await this.prisma.discount_codes.update({
      where: { id },
      data: updateData,
    });

    return {
      message: 'Discount code updated successfully',
      discount: this.formatDiscount(updated),
    };
  }

  /**
   * Delete discount code (Admin)
   */
  async remove(id: number) {
    const discount = await this.prisma.discount_codes.findUnique({
      where: { id },
      include: { _count: { select: { discount_usage: true } } },
    });

    if (!discount) {
      throw new NotFoundException('Discount code not found');
    }

    if (discount._count.discount_usage > 0) {
      throw new BadRequestException(
        'Cannot delete discount code with usage history. Consider deactivating instead.',
      );
    }

    await this.prisma.discount_codes.delete({ where: { id } });

    return { message: 'Discount code deleted successfully' };
  }

  /**
   * Validate discount code (Customer)
   */
  async validate(userId: number, validateDto: ValidateDiscountDto) {
    const { code, order_amount } = validateDto;

    const discount = await this.prisma.discount_codes.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount) {
      throw new NotFoundException('Invalid discount code');
    }

    // Check if active
    if (!discount.is_active) {
      throw new BadRequestException('Discount code is inactive');
    }

    // Check dates
    const now = new Date();
    if (now < discount.starts_at) {
      throw new BadRequestException('Discount code is not yet valid');
    }
    if (now > discount.ends_at) {
      throw new BadRequestException('Discount code has expired');
    }

    // Check min order amount
    if (
      discount.min_order_amount &&
      order_amount < Number(discount.min_order_amount)
    ) {
      throw new BadRequestException(
        `Minimum order amount is ${discount.min_order_amount} VND`,
      );
    }

    // Check max uses
    if (discount.max_uses && discount.used_count >= discount.max_uses) {
      throw new BadRequestException('Discount code has reached usage limit');
    }

    // Check user usage
    const userUsage = await this.prisma.discount_usage.count({
      where: {
        discount_id: discount.id,
        user_id: userId,
      },
    });

    if (
      discount.max_uses_per_user &&
      userUsage >= discount.max_uses_per_user
    ) {
      throw new BadRequestException(
        'You have reached the usage limit for this discount code',
      );
    }

    // Calculate discount amount
    const discountAmount = this.calculateDiscount(
      discount.discount_type as string,
      Number(discount.discount_value),
      order_amount,
      discount.max_discount_amount
        ? Number(discount.max_discount_amount)
        : null,
    );

    return {
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.discount_type,
        discount_amount: discountAmount,
        final_amount: Math.max(0, order_amount - discountAmount),
      },
    };
  }

  /**
   * Apply discount to order (Internal use)
   */
  async applyToOrder(
    userId: number,
    orderId: number,
    discountCode: string,
    orderAmount: number,
  ) {
    const validation = await this.validate(userId, {
      code: discountCode,
      order_amount: orderAmount,
    });

    const discount = await this.prisma.discount_codes.findUnique({
      where: { code: discountCode.toUpperCase() },
    });

    if (!discount) {
      throw new NotFoundException('Discount code not found');
    }

    // Record usage
    await this.prisma.$transaction(async (tx) => {
      await tx.discount_usage.create({
        data: {
          discount_id: discount.id,
          user_id: userId,
          order_id: orderId,
          discount_amount: validation.discount.discount_amount,
        },
      });

      await tx.discount_codes.update({
        where: { id: discount.id },
        data: { used_count: { increment: 1 } },
      });
    });

    return validation.discount.discount_amount;
  }

  /**
   * Get user's discount usage history
   */
  async getUserUsage(userId: number) {
    const usage = await this.prisma.discount_usage.findMany({
      where: { user_id: userId },
      include: {
        discount_codes: {
          select: { code: true, description: true, discount_type: true },
        },
        orders: {
          select: { order_number: true, total_amount: true, created_at: true },
        },
      },
      orderBy: { used_at: 'desc' },
    });

    return {
      usage: usage.map((u) => ({
        code: u.discount_codes.code,
        description: u.discount_codes.description,
        type: u.discount_codes.discount_type,
        discount_amount: Number(u.discount_amount),
        order_number: u.orders.order_number,
        order_total: Number(u.orders.total_amount),
        used_at: u.used_at,
      })),
    };
  }

  /**
   * Get discount statistics (Admin)
   */
  async getStatistics() {
    const [total, active, expired, totalUsage, topDiscounts] =
      await Promise.all([
        this.prisma.discount_codes.count(),
        this.prisma.discount_codes.count({
          where: {
            is_active: 1,
            ends_at: { gte: new Date() },
          },
        }),
        this.prisma.discount_codes.count({
          where: { ends_at: { lt: new Date() } },
        }),
        this.prisma.discount_usage.count(),
        this.prisma.discount_codes.findMany({
          orderBy: { used_count: 'desc' },
          take: 5,
          select: {
            code: true,
            description: true,
            used_count: true,
            discount_type: true,
            discount_value: true,
          },
        }),
      ]);

    return {
      total_codes: total,
      active_codes: active,
      expired_codes: expired,
      total_usage: totalUsage,
      top_used: topDiscounts,
    };
  }

  /**
   * Calculate discount amount
   */
  private calculateDiscount(
    type: string,
    value: number,
    orderAmount: number,
    maxDiscount: number | null,
  ): number {
    let discount = 0;

    if (type === 'percentage') {
      discount = (orderAmount * value) / 100;
    } else if (type === 'fixed_amount') {
      discount = value;
    } else if (type === 'free_shipping') {
      return 0; // Handled separately in order calculation
    }

    // Apply max discount cap
    if (maxDiscount && discount > maxDiscount) {
      discount = maxDiscount;
    }

    // Don't exceed order amount
    if (discount > orderAmount) {
      discount = orderAmount;
    }

    return Math.round(discount);
  }

  /**
   * Format discount response
   */
  private formatDiscount(discount: any) {
    return {
      id: discount.id,
      code: discount.code,
      description: discount.description,
      type: discount.discount_type,
      value: Number(discount.discount_value),
      min_order_amount: discount.min_order_amount
        ? Number(discount.min_order_amount)
        : null,
      max_discount_amount: discount.max_discount_amount
        ? Number(discount.max_discount_amount)
        : null,
      max_uses: discount.max_uses,
      max_uses_per_user: discount.max_uses_per_user,
      used_count: discount.used_count,
      starts_at: discount.starts_at,
      ends_at: discount.ends_at,
      is_active: discount.is_active === 1,
      usage_count: discount._count?.discount_usage,
      created_at: discount.created_at,
    };
  }
}
