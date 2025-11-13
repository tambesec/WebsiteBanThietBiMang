import prisma from '../config/database';
import { ERROR_MESSAGES } from '../config/constants';
import { PaginationResult } from '../utils/pagination';

export interface CreateReviewDTO {
    productId: number;
    rating: number;
    comment?: string;
    orderItemId?: number;
}

export const reviewService = {
    async createReview(userId: number, dto: CreateReviewDTO) {
        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: dto.productId },
        });

        if (!product) {
            throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        // Check if user already reviewed this product
        const existingReview = await prisma.productReview.findFirst({
            where: {
                userId,
                productId: dto.productId,
            },
        });

        if (existingReview) {
            throw new Error('Bạn đã đánh giá sản phẩm này rồi');
        }

        // Check if order item exists and belongs to user
        let isVerifiedPurchase = false;
        if (dto.orderItemId) {
            const orderItem = await prisma.orderItem.findFirst({
                where: {
                    id: dto.orderItemId,
                    order: {
                        userId,
                    },
                },
                include: {
                    order: true,
                },
            });

            if (orderItem) {
                isVerifiedPurchase = true;
            }
        }

        const review = await prisma.productReview.create({
            data: {
                userId,
                productId: dto.productId,
                orderItemId: dto.orderItemId,
                rating: dto.rating,
                comment: dto.comment,
                isVerifiedPurchase,
                isApproved: false,
            },
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
                    },
                },
            },
        });

        return review;
    },

    async getProductReviews(productId: number, pagination: PaginationResult) {
        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        const [reviews, total] = await Promise.all([
            prisma.productReview.findMany({
                where: {
                    productId,
                    isApproved: true,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                },
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.productReview.count({
                where: {
                    productId,
                    isApproved: true,
                },
            }),
        ]);

        return { reviews, total };
    },

    async getUserReviews(userId: number, pagination: PaginationResult) {
        const [reviews, total] = await Promise.all([
            prisma.productReview.findMany({
                where: { userId },
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.productReview.count({ where: { userId } }),
        ]);

        return { reviews, total };
    },

    async updateReview(reviewId: number, userId: number, dto: Partial<CreateReviewDTO>) {
        const review = await prisma.productReview.findUnique({
            where: { id: reviewId },
        });

        if (!review || review.userId !== userId) {
            throw new Error('Đánh giá không tồn tại');
        }

        const updated = await prisma.productReview.update({
            where: { id: reviewId },
            data: {
                ...(dto.rating && { rating: dto.rating }),
                ...(dto.comment && { comment: dto.comment }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return updated;
    },

    async deleteReview(reviewId: number, userId: number) {
        const review = await prisma.productReview.findUnique({
            where: { id: reviewId },
        });

        if (!review || review.userId !== userId) {
            throw new Error('Đánh giá không tồn tại');
        }

        await prisma.productReview.delete({
            where: { id: reviewId },
        });
    },

    async approveReview(reviewId: number) {
        const review = await prisma.productReview.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new Error('Đánh giá không tồn tại');
        }

        const approved = await prisma.productReview.update({
            where: { id: reviewId },
            data: { isApproved: true },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return approved;
    },

    async rejectReview(reviewId: number) {
        const review = await prisma.productReview.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new Error('Đánh giá không tồn tại');
        }

        await prisma.productReview.delete({
            where: { id: reviewId },
        });
    },

    async getProductRating(productId: number) {
        const result = await prisma.productReview.aggregate({
            where: {
                productId,
                isApproved: true,
            },
            _avg: {
                rating: true,
            },
            _count: true,
        });

        return {
            averageRating: result._avg.rating || 0,
            totalReviews: result._count,
        };
    },

    async getAllUnapprovedReviews(pagination: PaginationResult) {
        const [reviews, total] = await Promise.all([
            prisma.productReview.findMany({
                where: { isApproved: false },
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
                        },
                    },
                },
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { createdAt: 'asc' },
            }),
            prisma.productReview.count({ where: { isApproved: false } }),
        ]);

        return { reviews, total };
    },
};
