import prisma from '../config/database';
import { ERROR_MESSAGES } from '../config/constants';

export interface CartItemDTO {
    productItemId: number;
    quantity: number;
}

export const cartService = {
    async getOrCreateCart(userId: number) {
        let cart = await prisma.shoppingCart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        productItem: {
                            include: {
                                product: {
                                    include: {
                                        images: {
                                            where: { isPrimary: true },
                                            take: 1,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!cart) {
            const newCart = await prisma.shoppingCart.create({
                data: {
                    userId,
                },
                include: {
                    items: {
                        include: {
                            productItem: {
                                include: {
                                    product: {
                                        include: {
                                            images: {
                                                where: { isPrimary: true },
                                                take: 1,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            cart = newCart;
        }

        return cart;
    },

    async getCart(userId: number) {
        const cart = await this.getOrCreateCart(userId);
        return cart;
    },

    async getCartItems(cartId: number) {
        const items = await prisma.cartItem.findMany({
            where: { cartId },
            include: {
                productItem: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { isPrimary: true },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
        });

        return items;
    },

    async addToCart(userId: number, dto: CartItemDTO) {
        // Get or create cart
        const cart = await this.getOrCreateCart(userId);

        // Check if product item exists
        const productItem = await prisma.productItem.findUnique({
            where: { id: dto.productItemId },
        });

        if (!productItem) {
            throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        // Check if item already in cart
        let cartItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productItemId: dto.productItemId,
            },
        });

        if (cartItem) {
            // Update quantity
            cartItem = await prisma.cartItem.update({
                where: { id: cartItem.id },
                data: {
                    quantity: cartItem.quantity + dto.quantity,
                },
                include: {
                    productItem: {
                        include: {
                            product: {
                                include: {
                                    images: {
                                        where: { isPrimary: true },
                                        take: 1,
                                    },
                                },
                            },
                        },
                    },
                },
            });
        } else {
            // Create new cart item
            cartItem = await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productItemId: dto.productItemId,
                    quantity: dto.quantity,
                },
                include: {
                    productItem: {
                        include: {
                            product: {
                                include: {
                                    images: {
                                        where: { isPrimary: true },
                                        take: 1,
                                    },
                                },
                            },
                        },
                    },
                },
            });
        }

        return cartItem;
    },

    async updateCartItem(userId: number, cartItemId: number, quantity: number) {
        // Verify cart item belongs to user
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: {
                cart: true,
            },
        });

        if (!cartItem || cartItem.cart.userId !== userId) {
            throw new Error('Mặt hàng giỏ hàng không tồn tại');
        }

        if (quantity <= 0) {
            throw new Error(ERROR_MESSAGES.INVALID_QUANTITY);
        }

        const updated = await prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
            include: {
                productItem: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { isPrimary: true },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
        });

        return updated;
    },

    async removeFromCart(userId: number, cartItemId: number) {
        // Verify cart item belongs to user
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: {
                cart: true,
            },
        });

        if (!cartItem || cartItem.cart.userId !== userId) {
            throw new Error('Mặt hàng giỏ hàng không tồn tại');
        }

        await prisma.cartItem.delete({
            where: { id: cartItemId },
        });
    },

    async clearCart(userId: number) {
        const cart = await prisma.shoppingCart.findUnique({
            where: { userId },
        });

        if (!cart) {
            return;
        }

        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
    },

    async getCartTotal(cartId: number) {
        const items = await prisma.cartItem.findMany({
            where: { cartId },
            include: {
                productItem: true,
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const total = items.reduce((sum: number, item: any) => {
            const price = Number(item.productItem.price);
            return sum + price * item.quantity;
        }, 0);

        return total;
    },
};
