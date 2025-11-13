import prisma from '../config/database';
import { ERROR_MESSAGES, ORDER_STATUS } from '../config/constants';
import { PaginationResult } from '../utils/pagination';
import { cartService } from './cartService';

export interface CreateOrderDTO {
    shippingAddressId: number;
    billingAddressId?: number;
    paymentMethodId: number;
    shippingMethodId: number;
    discountCode?: string;
    customerNote?: string;
}

export interface OrderItemDTO {
    productItemId: number;
    quantity: number;
}

export const orderService = {
    async createOrder(userId: number, dto: CreateOrderDTO) {
        // Get user cart
        const cart = await prisma.shoppingCart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        productItem: true,
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            throw new Error(ERROR_MESSAGES.CART_EMPTY);
        }

        // Verify addresses exist and belong to user
        const shippingAddress = await prisma.userAddress.findFirst({
            where: {
                userId,
                addressId: dto.shippingAddressId,
            },
        });

        if (!shippingAddress) {
            throw new Error('Địa chỉ giao hàng không hợp lệ');
        }

        const billingAddressId = dto.billingAddressId || dto.shippingAddressId;
        const billingAddress = await prisma.userAddress.findFirst({
            where: {
                userId,
                addressId: billingAddressId,
            },
        });

        if (!billingAddress) {
            throw new Error('Địa chỉ thanh toán không hợp lệ');
        }

        // Verify payment method
        const paymentMethod = await prisma.userPayment.findFirst({
            where: {
                userId,
                id: dto.paymentMethodId,
            },
        });

        if (!paymentMethod) {
            throw new Error('Phương thức thanh toán không hợp lệ');
        }

        // Verify shipping method
        const shippingMethod = await prisma.shippingMethod.findUnique({
            where: { id: dto.shippingMethodId },
        });

        if (!shippingMethod) {
            throw new Error('Phương thức vận chuyển không hợp lệ');
        }

        // Calculate order total
        let subtotal = 0;
        for (const item of cart.items) {
            const price = Number(item.productItem.price);
            subtotal += price * item.quantity;
        }

        let discount = 0;
        if (dto.discountCode) {
            const discountRecord = await prisma.discount.findUnique({
                where: { code: dto.discountCode },
            });

            if (discountRecord && discountRecord.isActive) {
                if (new Date() <= discountRecord.endsAt) {
                    if (
                        !discountRecord.minOrderAmount ||
                        subtotal >= Number(discountRecord.minOrderAmount)
                    ) {
                        if (
                            !discountRecord.maxUses ||
                            discountRecord.usedCount < discountRecord.maxUses
                        ) {
                            if (discountRecord.discountType === 'percentage') {
                                discount =
                                    (subtotal * Number(discountRecord.discountValue)) / 100;
                            } else {
                                discount = Number(discountRecord.discountValue);
                            }

                            // Update discount usage
                            await prisma.discount.update({
                                where: { id: discountRecord.id },
                                data: { usedCount: discountRecord.usedCount + 1 },
                            });
                        }
                    }
                }
            }
        }

        const shippingFee = Number(shippingMethod.basePrice);
        const totalAmount = subtotal - discount + shippingFee;

        // Get initial order status
        const pendingStatus = await prisma.orderStatus.findFirst({
            where: { name: ORDER_STATUS.PENDING },
        });

        if (!pendingStatus) {
            throw new Error('Trạng thái đơn hàng không tồn tại');
        }

        // Create order
        const orderNumber = `ORD-${Date.now()}-${userId}`;

        const order = await prisma.shopOrder.create({
            data: {
                orderNumber,
                userId,
                shippingAddressId: dto.shippingAddressId,
                billingAddressId: billingAddressId,
                paymentMethodId: dto.paymentMethodId,
                shippingMethodId: dto.shippingMethodId,
                discountId: dto.discountCode ? undefined : undefined,
                statusId: pendingStatus.id,
                subtotal: subtotal.toString(),
                discountAmount: discount.toString(),
                shippingFee: shippingFee.toString(),
                totalAmount: totalAmount.toString(),
                customerNote: dto.customerNote,
                orderedAt: new Date(),
                items: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    create: cart.items.map((item: any) => ({
                        productItemId: item.productItemId,
                        productName: item.productItem.product.name,
                        sku: item.productItem.sku,
                        quantity: item.quantity,
                        unitPrice: item.productItem.price.toString(),
                        subtotal: (Number(item.productItem.price) * item.quantity).toString(),
                    })),
                },
            },
            include: {
                items: true,
                status: true,
            },
        });

        // Clear cart
        await cartService.clearCart(userId);

        return order;
    },

    async getOrders(userId: number, pagination: PaginationResult) {
        const [orders, total] = await Promise.all([
            prisma.shopOrder.findMany({
                where: { userId },
                include: {
                    status: true,
                    items: true,
                    shippingAddress: true,
                },
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.shopOrder.count({ where: { userId } }),
        ]);

        return { orders, total };
    },

    async getOrderById(orderId: number, userId: number) {
        const order = await prisma.shopOrder.findUnique({
            where: { id: orderId },
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
                status: true,
                shippingAddress: true,
                billingAddress: true,
                user: true,
            },
        });

        if (!order || order.userId !== userId) {
            throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
        }

        return order;
    },

    async getOrderItems(orderId: number, userId: number) {
        const order = await prisma.shopOrder.findUnique({
            where: { id: orderId },
        });

        if (!order || order.userId !== userId) {
            throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
        }

        const items = await prisma.orderItem.findMany({
            where: { orderId },
            include: {
                productItem: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        return items;
    },

    async updateOrderStatus(
        orderId: number,
        statusId: number,
        note?: string
    ) {
        const order = await prisma.shopOrder.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
        }

        // Update order status
        await prisma.shopOrder.update({
            where: { id: orderId },
            data: { statusId },
        });

        // Create status history
        const history = await prisma.orderStatusHistory.create({
            data: {
                orderId,
                statusId,
                note,
                createdBy: 1, // Should come from authenticated user
            },
        });

        return history;
    },

    async cancelOrder(orderId: number, userId: number, reason?: string) {
        const order = await prisma.shopOrder.findUnique({
            where: { id: orderId },
        });

        if (!order || order.userId !== userId) {
            throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
        }

        const cancelledStatus = await prisma.orderStatus.findFirst({
            where: { name: ORDER_STATUS.CANCELLED },
        });

        if (!cancelledStatus) {
            throw new Error('Không tìm thấy trạng thái hủy');
        }

        // Update order status
        await prisma.shopOrder.update({
            where: { id: orderId },
            data: { statusId: cancelledStatus.id },
        });

        // Create status history
        await prisma.orderStatusHistory.create({
            data: {
                orderId,
                statusId: cancelledStatus.id,
                note: reason,
                createdBy: userId,
            },
        });
    },

    async getOrderStatusHistory(orderId: number, userId: number) {
        const order = await prisma.shopOrder.findUnique({
            where: { id: orderId },
        });

        if (!order || order.userId !== userId) {
            throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
        }

        const history = await prisma.orderStatusHistory.findMany({
            where: { orderId },
            include: {
                status: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        return history;
    },
};

// Helper for Decimal type
class Decimal {
    constructor(private value: number) { }

    toString() {
        return this.value.toString();
    }
}
