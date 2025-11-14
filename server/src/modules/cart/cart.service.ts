import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user's cart with all items
   * Security: User can only access their own cart
   */
  async getCart(userId: number) {
    let cart = await this.prisma.shoppingCart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productItem: {
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
            },
          },
        },
      },
    });

    // Create cart if doesn't exist
    if (!cart) {
      cart = await this.prisma.shoppingCart.create({
        data: { userId },
        include: {
          items: {
            include: {
              productItem: {
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
              },
            },
          },
        },
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.productItem.price) * item.quantity;
    }, 0);

    return {
      ...cart,
      itemCount: cart.items.length,
      subtotal,
    };
  }

  /**
   * Add item to cart
   * Security: Validates stock availability, prevents over-ordering
   */
  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const { productItemId, quantity } = addToCartDto;

    // Verify product item exists and is active
    const productItem = await this.prisma.productItem.findUnique({
      where: { id: productItemId },
      include: {
        product: {
          select: { isActive: true, name: true },
        },
      },
    });

    if (!productItem || !productItem.isActive || !productItem.product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    // Check stock availability
    if (productItem.qtyInStock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${productItem.qtyInStock}, Requested: ${quantity}`,
      );
    }

    // Get or create cart
    let cart = await this.prisma.shoppingCart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.shoppingCart.create({
        data: { userId },
      });
    }

    // Check if item already in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productItemId,
      },
    });

    if (existingItem) {
      // Update quantity if already exists
      const newQuantity = existingItem.quantity + quantity;

      // Verify new quantity doesn't exceed stock
      if (newQuantity > productItem.qtyInStock) {
        throw new BadRequestException(
          `Cannot add ${quantity} more. Maximum available: ${productItem.qtyInStock - existingItem.quantity}`,
        );
      }

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          productItem: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // Add new item to cart
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productItemId,
        quantity,
      },
      include: {
        productItem: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Update cart item quantity
   * Security: User can only update their own cart items
   */
  async updateCartItem(userId: number, itemId: number, updateDto: UpdateCartItemDto) {
    const { quantity } = updateDto;

    // Get cart item and verify ownership
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        productItem: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Security: Verify user owns this cart
    if (cartItem.cart.userId !== userId) {
      throw new ForbiddenException('You can only modify your own cart');
    }

    // Check stock availability
    if (cartItem.productItem.qtyInStock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${cartItem.productItem.qtyInStock}`,
      );
    }

    // Check if product is still active
    if (!cartItem.productItem.isActive || !cartItem.productItem.product.isActive) {
      throw new BadRequestException('Product is no longer available');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        productItem: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Remove item from cart
   * Security: User can only remove from their own cart
   */
  async removeCartItem(userId: number, itemId: number) {
    // Get cart item and verify ownership
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Security: Verify user owns this cart
    if (cartItem.cart.userId !== userId) {
      throw new ForbiddenException('You can only modify your own cart');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return { message: 'Item removed from cart' };
  }

  /**
   * Clear entire cart
   * Security: User can only clear their own cart
   */
  async clearCart(userId: number) {
    const cart = await this.prisma.shoppingCart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: 'Cart cleared successfully' };
  }
}
