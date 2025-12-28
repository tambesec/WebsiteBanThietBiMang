import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  /**
   * Subscribe email to newsletter (public endpoint)
   */
  async subscribe(dto: SubscribeNewsletterDto) {
    const existing = await this.prisma.newsletter_subscribers.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      if (existing.status === 'active') {
        throw new ConflictException('Email này đã đăng ký nhận tin');
      }
      // Re-subscribe if previously unsubscribed
      return this.prisma.newsletter_subscribers.update({
        where: { email: dto.email },
        data: {
          status: 'active',
          subscribed_at: new Date(),
          unsubscribed_at: null,
        },
      });
    }

    return this.prisma.newsletter_subscribers.create({
      data: {
        email: dto.email,
        status: 'active',
      },
    });
  }

  /**
   * Get all subscribers (admin only)
   */
  async findAll(
    page = 1,
    limit = 50,
    status?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    const [subscribers, total] = await Promise.all([
      this.prisma.newsletter_subscribers.findMany({
        where,
        skip,
        take: limit,
        orderBy: { subscribed_at: 'desc' },
      }),
      this.prisma.newsletter_subscribers.count({ where }),
    ]);

    return {
      subscribers,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
        has_next_page: page * limit < total,
        has_prev_page: page > 1,
      },
    };
  }

  /**
   * Unsubscribe email from newsletter (public endpoint with token)
   */
  async unsubscribe(email: string) {
    const subscriber = await this.prisma.newsletter_subscribers.findUnique({
      where: { email },
    });

    if (!subscriber) {
      throw new NotFoundException('Email không tồn tại trong danh sách');
    }

    if (subscriber.status === 'unsubscribed') {
      throw new ConflictException('Email đã hủy đăng ký trước đó');
    }

    return this.prisma.newsletter_subscribers.update({
      where: { email },
      data: {
        status: 'unsubscribed',
        unsubscribed_at: new Date(),
      },
    });
  }

  /**
   * Delete subscriber (admin only)
   */
  async delete(id: number) {
    const subscriber = await this.prisma.newsletter_subscribers.findUnique({
      where: { id },
    });

    if (!subscriber) {
      throw new NotFoundException(`Không tìm thấy subscriber với ID ${id}`);
    }

    return this.prisma.newsletter_subscribers.delete({
      where: { id },
    });
  }

  /**
   * Get statistics (admin only)
   */
  async getStats() {
    const [total, active, unsubscribed] = await Promise.all([
      this.prisma.newsletter_subscribers.count(),
      this.prisma.newsletter_subscribers.count({ where: { status: 'active' } }),
      this.prisma.newsletter_subscribers.count({ where: { status: 'unsubscribed' } }),
    ]);

    return {
      total,
      active,
      unsubscribed,
    };
  }
}
