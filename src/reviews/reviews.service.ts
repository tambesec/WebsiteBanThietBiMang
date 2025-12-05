import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AdminReplyDto } from './dto/admin-reply.dto';
import { QueryReviewDto } from './dto/query-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new review
   * - Validates product exists
   * - Checks if user purchased the product (optional)
   * - Prevents duplicate reviews for the same product
   */
  async create(userId: number, createReviewDto: CreateReviewDto) {
    const { product_id, order_id, rating, title, comment, images } =
      createReviewDto;

    // Check if product exists and is active
    const product = await this.prisma.products.findUnique({
      where: { id: product_id },
      select: { id: true, name: true, is_active: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.is_active) {
      throw new BadRequestException('Cannot review inactive product');
    }

    // Check if user already reviewed this product
    const existingReview = await this.prisma.product_reviews.findFirst({
      where: {
        user_id: userId,
        product_id,
      },
    });

    if (existingReview) {
      throw new ConflictException(
        'You have already reviewed this product. You can update your existing review.',
      );
    }

    // Verify purchase if order_id provided
    let isVerifiedPurchase = 0;
    if (order_id) {
      const order = await this.prisma.orders.findFirst({
        where: {
          id: order_id,
          user_id: userId,
          status_id: 5, // Delivered
        },
        include: {
          order_items: {
            where: { product_id },
            select: { id: true },
          },
        },
      });

      if (!order || order.order_items.length === 0) {
        throw new BadRequestException(
          'Invalid order ID or product not found in this order',
        );
      }

      isVerifiedPurchase = 1;
    }

    // Create review
    const review = await this.prisma.product_reviews.create({
      data: {
        user_id: userId,
        product_id,
        order_id: order_id || null,
        rating,
        title: title || null,
        comment: comment || null,
        // images: images && images.length > 0 ? JSON.stringify(images) : null, // TODO: Add after migration
        is_verified_purchase: isVerifiedPurchase,
        is_approved: 0, // Pending approval
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
            primary_image: true,
          },
        },
      },
    });

    return this.formatReviewResponse(review);
  }

  /**
   * Get all reviews with filtering and pagination
   */
  async findAll(query: QueryReviewDto) {
    const {
      product_id,
      user_id,
      rating,
      status,
      verified,
      search,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (product_id) {
      where.product_id = product_id;
    }

    if (user_id) {
      where.user_id = user_id;
    }

    if (rating) {
      where.rating = rating;
    }

    // Approval status filter
    if (status && status !== 'all') {
      if (status === 'approved') {
        where.is_approved = 1;
      } else if (status === 'pending') {
        where.is_approved = 0;
      }
    }

    // Verified purchase filter
    if (verified && verified !== 'all') {
      where.is_verified_purchase = verified === 'true' ? 1 : 0;
    }

    // Search in title and comment
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { comment: { contains: search } },
      ];
    }

    // Get reviews and total count
    const [reviews, total] = await Promise.all([
      this.prisma.product_reviews.findMany({
        where,
        skip,
        take: limit,
        orderBy:
          sort_by === 'rating'
            ? { rating: sort_order as 'asc' | 'desc' }
            : { created_at: sort_order as 'asc' | 'desc' },
        include: {
          users: {
            select: {
              id: true,
              full_name: true,
            },
          },
          products: {
            select: {
              id: true,
              name: true,
              slug: true,
              primary_image: true,
            },
          },
        },
      }),
      this.prisma.product_reviews.count({ where }),
    ]);

    return {
      reviews: reviews.map((review) => this.formatReviewResponse(review)),
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
   * Get single review by ID
   */
  async findOne(id: number) {
    const review = await this.prisma.product_reviews.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
            primary_image: true,
          },
        },
        orders: {
          select: {
            id: true,
            order_number: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.formatReviewResponse(review);
  }

  /**
   * Update review (only by owner)
   */
  async update(
    id: number,
    userId: number,
    updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.prisma.product_reviews.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const { rating, title, comment, images } = updateReviewDto;

    const updated = await this.prisma.product_reviews.update({
      where: { id },
      data: {
        ...(rating && { rating }),
        ...(title !== undefined && { title: title || null }),
        ...(comment !== undefined && { comment: comment || null }),
        ...(images !== undefined && {
          images: images && images.length > 0 ? JSON.stringify(images) : null,
        }),
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
            primary_image: true,
          },
        },
      },
    });

    return this.formatReviewResponse(updated);
  }

  /**
   * Delete review (only by owner or admin)
   */
  async remove(id: number, userId: number, isAdmin: boolean) {
    const review = await this.prisma.product_reviews.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (!isAdmin && review.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.product_reviews.delete({
      where: { id },
    });

    return {
      message: 'Review deleted successfully',
      review_id: id,
    };
  }

  /**
   * Approve review (admin only)
   */
  async approve(id: number) {
    const review = await this.prisma.product_reviews.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.is_approved === 1) {
      throw new BadRequestException('Review is already approved');
    }

    const updated = await this.prisma.product_reviews.update({
      where: { id },
      data: {
        is_approved: 1,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Review approved successfully',
      review: this.formatReviewResponse(updated),
    };
  }

  /**
   * Reject review (admin only)
   */
  async reject(id: number) {
    const review = await this.prisma.product_reviews.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const updated = await this.prisma.product_reviews.update({
      where: { id },
      data: {
        is_approved: 0,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Review rejected successfully',
      review: this.formatReviewResponse(updated),
    };
  }

  /**
   * Add admin reply to review
   */
  async addReply(id: number, adminId: number, replyDto: AdminReplyDto) {
    const review = await this.prisma.product_reviews.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const updated = await this.prisma.product_reviews.update({
      where: { id },
      data: {
        admin_reply: replyDto.admin_reply,
        // replied_at: new Date(), // TODO: Add after migration
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Reply added successfully',
      review: this.formatReviewResponse(updated),
    };
  }

  /**
   * Increment helpful count
   */
  async markHelpful(id: number) {
    const review = await this.prisma.product_reviews.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // TODO: Uncomment after migration
    // await this.prisma.product_reviews.update({
    //   where: { id },
    //   data: {
    //     helpful_count: {
    //       increment: 1,
    //     },
    //   },
    // });

    return {
      message: 'Review marked as helpful (feature coming soon)',
      // helpful_count: review.helpful_count + 1,
    };
  }

  /**
   * Get product rating statistics
   */
  async getProductStats(productId: number) {
    const [reviews, stats] = await Promise.all([
      this.prisma.product_reviews.findMany({
        where: {
          product_id: productId,
          is_approved: 1,
        },
        select: {
          rating: true,
        },
      }),
      this.prisma.product_reviews.groupBy({
        by: ['rating'],
        where: {
          product_id: productId,
          is_approved: 1,
        },
        _count: {
          rating: true,
        },
      }),
    ]);

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    stats.forEach((stat) => {
      ratingDistribution[stat.rating] = stat._count.rating;
    });

    return {
      product_id: productId,
      total_reviews: totalReviews,
      average_rating: Math.round(averageRating * 10) / 10,
      rating_distribution: ratingDistribution,
    };
  }

  /**
   * Format review response
   */
  private formatReviewResponse(review: any) {
    return {
      id: review.id,
      user: {
        id: review.users.id,
        name: review.users.full_name,
        email: review.users.email || undefined,
      },
      product: {
        id: review.products.id,
        name: review.products.name,
        slug: review.products.slug,
        image: review.products.primary_image,
      },
      order: review.orders
        ? {
            id: review.orders.id,
            order_number: review.orders.order_number,
          }
        : null,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      // images: review.images ? JSON.parse(review.images) : [], // TODO: Add after migration
      is_verified_purchase: review.is_verified_purchase === 1,
      is_approved: review.is_approved === 1,
      // helpful_count: review.helpful_count, // TODO: Add after migration
      admin_reply: review.admin_reply,
      // replied_at: review.replied_at, // TODO: Add after migration
      created_at: review.created_at,
      updated_at: review.updated_at,
    };
  }
}
