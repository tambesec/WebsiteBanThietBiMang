import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get existing cart (does not create if not exists)
   * Returns null if cart doesn't exist
   */
  async getCart(userId?: number, sessionId?: string) {
    // Must have either userId or sessionId
    if (!userId && !sessionId) {
      return null;
    }

    let cart;

    // Priority 1: Find by user_id (authenticated users)
    if (userId) {
      cart = await this.prisma.shopping_carts.findFirst({
        where: { user_id: userId },
        include: {
          cart_items: {
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  compare_at_price: true,
                  stock_quantity: true,
                  primary_image: true,
                  is_active: true,
                },
              },
            },
          },
        },
      });
    } else if (sessionId) {
      // Priority 2: Find by session_id (guest users)
      cart = await this.prisma.shopping_carts.findFirst({
        where: {
          session_id: sessionId,
          user_id: null, // Only guest carts
        },
        include: {
          cart_items: {
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  compare_at_price: true,
                  stock_quantity: true,
                  primary_image: true,
                  is_active: true,
                },
              },
            },
          },
        },
      });
    }

    if (!cart) {
      return null;
    }

    return this.formatCartResponse(cart);
  }

  /**
   * Get or create cart for user/session (internal use)
   * Security: Validates user_id matches authenticated user OR uses session_id
   */
  private async getOrCreateCart(userId?: number, sessionId?: string) {
    // Security: Must have either userId or sessionId
    if (!userId && !sessionId) {
      throw new UnauthorizedException(
        'Must be authenticated or have valid session',
      );
    }

    let cart;

    // Priority 1: Find by user_id (authenticated users)
    if (userId) {
      cart = await this.prisma.shopping_carts.findFirst({
        where: { user_id: userId },
        include: {
          cart_items: {
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  compare_at_price: true,
                  stock_quantity: true,
                  primary_image: true,
                  is_active: true,
                },
              },
            },
          },
        },
      });

      // Create cart if not exists
      if (!cart) {
        cart = await this.prisma.shopping_carts.create({
          data: {
            user_id: userId,
            session_id: sessionId,
          },
          include: {
            cart_items: {
              include: {
                products: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    compare_at_price: true,
                    stock_quantity: true,
                    primary_image: true,
                    is_active: true,
                  },
                },
              },
            },
          },
        });
        this.logger.log(`Created new cart for user ${userId}`);
      }
    } else {
      // Priority 2: Find by session_id (guest users)
      cart = await this.prisma.shopping_carts.findFirst({
        where: {
          session_id: sessionId,
          user_id: null, // Only guest carts
        },
        include: {
          cart_items: {
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  compare_at_price: true,
                  stock_quantity: true,
                  primary_image: true,
                  is_active: true,
                },
              },
            },
          },
        },
      });

      // Create cart if not exists
      if (!cart) {
        cart = await this.prisma.shopping_carts.create({
          data: {
            session_id: sessionId,
          },
          include: {
            cart_items: {
              include: {
                products: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    compare_at_price: true,
                    stock_quantity: true,
                    primary_image: true,
                    is_active: true,
                  },
                },
              },
            },
          },
        });
        this.logger.log(`Created new cart for session ${sessionId}`);
      }
    }

    return this.formatCartResponse(cart);
  }

  /**
   * Add product to cart
   * Security: Validates product exists, is active, has stock
   */
  async addToCart(
    dto: AddToCartDto,
    userId?: number,
    sessionId?: string,
  ) {
    // Security: Validate product exists and is active
    const product = await this.prisma.products.findUnique({
      where: { id: dto.product_id },
      select: {
        id: true,
        name: true,
        price: true,
        compare_at_price: true,
        stock_quantity: true,
        is_active: true,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${dto.product_id} not found`,
      );
    }

    if (!product.is_active) {
      throw new BadRequestException(
        'Product is not available for purchase',
      );
    }

    // Security: Validate stock availability
    if (product.stock_quantity < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stock_quantity}`,
      );
    }

    // Get or create cart
    const cart = await this.getOrCreateCart(userId, sessionId);

    // Check if product already in cart
    const existingItem = await this.prisma.cart_items.findFirst({
      where: {
        cart_id: cart.id,
        product_id: dto.product_id,
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + dto.quantity;

      // Security: Validate total quantity doesn't exceed stock
      if (newQuantity > product.stock_quantity) {
        throw new BadRequestException(
          `Cannot add ${dto.quantity} more. Stock limit: ${product.stock_quantity}, current in cart: ${existingItem.quantity}`,
        );
      }

      // Security: Enforce maximum quantity per item
      if (newQuantity > 99) {
        throw new BadRequestException(
          'Maximum quantity per item is 99',
        );
      }

      await this.prisma.cart_items.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });

      this.logger.log(
        `Updated cart item ${existingItem.id} quantity to ${newQuantity}`,
      );
    } else {
      // Add new item
      await this.prisma.cart_items.create({
        data: {
          cart_id: cart.id,
          product_id: dto.product_id,
          quantity: dto.quantity,
        },
      });

      this.logger.log(
        `Added product ${dto.product_id} to cart ${cart.id}`,
      );
    }

    // Update cart timestamp
    await this.prisma.shopping_carts.update({
      where: { id: cart.id },
      data: { updated_at: new Date() },
    });

    // Return updated cart
    return this.getCart(userId, sessionId);
  }

  /**
   * Update cart item quantity
   * Security: Validates ownership, stock availability
   */
  async updateCartItem(
    itemId: number,
    dto: UpdateCartItemDto,
    userId?: number,
    sessionId?: string,
  ) {
    // Get cart item with ownership validation
    const cartItem = await this.prisma.cart_items.findUnique({
      where: { id: itemId },
      include: {
        shopping_carts: true,
        products: {
          select: {
            id: true,
            name: true,
            stock_quantity: true,
            is_active: true,
          },
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Security: Verify cart ownership
    const isOwner =
      (userId && cartItem.shopping_carts.user_id === userId) ||
      (sessionId && cartItem.shopping_carts.session_id === sessionId);

    if (!isOwner) {
      throw new UnauthorizedException(
        'You do not have permission to modify this cart item',
      );
    }

    // If quantity is 0, remove item
    if (dto.quantity === 0) {
      await this.prisma.cart_items.delete({
        where: { id: itemId },
      });

      this.logger.log(`Removed cart item ${itemId}`);

      // Update cart timestamp
      await this.prisma.shopping_carts.update({
        where: { id: cartItem.cart_id },
        data: { updated_at: new Date() },
      });

      return this.getCart(userId, sessionId);
    }

    // Security: Validate product is still active
    if (!cartItem.products.is_active) {
      throw new BadRequestException(
        'Product is no longer available',
      );
    }

    // Security: Validate stock availability
    if (dto.quantity > cartItem.products.stock_quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${cartItem.products.stock_quantity}`,
      );
    }

    // Update quantity
    await this.prisma.cart_items.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    this.logger.log(
      `Updated cart item ${itemId} quantity to ${dto.quantity}`,
    );

    // Update cart timestamp
    await this.prisma.shopping_carts.update({
      where: { id: cartItem.cart_id },
      data: { updated_at: new Date() },
    });

    return this.getCart(userId, sessionId);
  }

  /**
   * Remove item from cart
   * Security: Validates ownership
   */
  async removeCartItem(
    itemId: number,
    userId?: number,
    sessionId?: string,
  ) {
    const cartItem = await this.prisma.cart_items.findUnique({
      where: { id: itemId },
      include: {
        shopping_carts: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Security: Verify cart ownership
    const isOwner =
      (userId && cartItem.shopping_carts.user_id === userId) ||
      (sessionId && cartItem.shopping_carts.session_id === sessionId);

    if (!isOwner) {
      throw new UnauthorizedException(
        'You do not have permission to remove this cart item',
      );
    }

    await this.prisma.cart_items.delete({
      where: { id: itemId },
    });

    this.logger.log(`Removed cart item ${itemId}`);

    // Update cart timestamp
    await this.prisma.shopping_carts.update({
      where: { id: cartItem.cart_id },
      data: { updated_at: new Date() },
    });

    return this.getCart(userId, sessionId);
  }

  /**
   * Clear entire cart
   * Security: Validates ownership
   */
  async clearCart(userId?: number, sessionId?: string) {
    const cart = await this.getCart(userId, sessionId);
    
    if (!cart) {
      return { message: 'Cart is already empty' };
    }

    if (cart.items.length === 0) {
      return cart;
    }

    // Delete all items
    await this.prisma.cart_items.deleteMany({
      where: { cart_id: cart.id },
    });

    this.logger.log(`Cleared cart ${cart.id}`);

    // Update cart timestamp
    await this.prisma.shopping_carts.update({
      where: { id: cart.id },
      data: { updated_at: new Date() },
    });

    return this.getCart(userId, sessionId);
  }

  /**
   * Merge guest cart into user cart after login
   * Security: Only callable internally or by auth service
   */
  async mergeGuestCart(userId: number, sessionId: string) {
    // Find guest cart
    const guestCart = await this.prisma.shopping_carts.findFirst({
      where: {
        session_id: sessionId,
        user_id: null,
      },
      include: {
        cart_items: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!guestCart || guestCart.cart_items.length === 0) {
      this.logger.log(`No guest cart to merge for session ${sessionId}`);
      return this.getCart(userId, sessionId);
    }

    // Get or create user cart
    let userCart = await this.prisma.shopping_carts.findFirst({
      where: { user_id: userId },
    });

    if (!userCart) {
      // Convert guest cart to user cart
      userCart = await this.prisma.shopping_carts.update({
        where: { id: guestCart.id },
        data: {
          user_id: userId,
          updated_at: new Date(),
        },
      });

      this.logger.log(
        `Converted guest cart ${guestCart.id} to user cart for user ${userId}`,
      );
    } else {
      // Merge items using transaction
      await this.prisma.$transaction(async (tx) => {
        for (const guestItem of guestCart.cart_items) {
          // Check if product exists in stock and is active
          if (
            !guestItem.products.is_active ||
            guestItem.products.stock_quantity < guestItem.quantity
          ) {
            this.logger.warn(
              `Skipping product ${guestItem.product_id} - not available`,
            );
            continue;
          }

          // Check if product already in user cart
          const existingItem = await tx.cart_items.findFirst({
            where: {
              cart_id: userCart!.id,
              product_id: guestItem.product_id,
            },
          });

          if (existingItem) {
            // Merge quantities (respect limits)
            const newQuantity = Math.min(
              existingItem.quantity + guestItem.quantity,
              guestItem.products.stock_quantity,
              99,
            );

            await tx.cart_items.update({
              where: { id: existingItem.id },
              data: { quantity: newQuantity },
            });
          } else {
            // Move item to user cart
            await tx.cart_items.update({
              where: { id: guestItem.id },
              data: { cart_id: userCart!.id },
            });
          }
        }

        // Delete guest cart
        await tx.shopping_carts.delete({
          where: { id: guestCart.id },
        });

        // Update user cart timestamp
        await tx.shopping_carts.update({
          where: { id: userCart!.id },
          data: { updated_at: new Date() },
        });
      });

      this.logger.log(
        `Merged guest cart ${guestCart.id} into user cart ${userCart.id}`,
      );
    }

    return this.getCart(userId, sessionId);
  }

  /**
   * Validate cart before checkout
   * Security: Checks product availability, stock, active status
   */
  async validateCart(userId?: number, sessionId?: string) {
    const cart = await this.getCart(userId, sessionId);

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const errors: string[] = [];

    // Validate each item
    for (const item of cart.items) {
      const product = await this.prisma.products.findUnique({
        where: { id: item.product.id },
        select: {
          id: true,
          name: true,
          is_active: true,
          stock_quantity: true,
          price: true,
          compare_at_price: true,
        },
      });

      if (!product) {
        errors.push(`Product "${item.product.name}" no longer exists`);
        continue;
      }

      if (!product.is_active) {
        errors.push(`Product "${product.name}" is no longer available`);
        continue;
      }

      if (product.stock_quantity < item.quantity) {
        errors.push(
          `Product "${product.name}" has insufficient stock (available: ${product.stock_quantity}, requested: ${item.quantity})`,
        );
        continue;
      }

      // Check if price changed
      const currentPrice =
        product.compare_at_price || product.price;
      const cartPrice =
        item.product.compare_at_price || item.product.price;

      if (currentPrice.toString() !== cartPrice.toString()) {
        errors.push(
          `Product "${product.name}" price has changed (was ${cartPrice}, now ${currentPrice})`,
        );
      }
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        cart,
      };
    }

    return {
      valid: true,
      errors: [],
      cart,
    };
  }

  /**
   * Format cart response with calculations
   * Private helper method
   */
  private formatCartResponse(cart: any) {
    const items = cart.cart_items.map((item) => {
      const price = item.products.compare_at_price || item.products.price;
      const subtotal = price * item.quantity;

      return {
        id: item.id,
        product: {
          id: item.products.id,
          name: item.products.name,
          slug: item.products.slug,
          price: item.products.price,
          compare_at_price: item.products.compare_at_price,
          stock_quantity: item.products.stock_quantity,
          primary_image: item.products.primary_image,
          is_active: item.products.is_active,
        },
        quantity: item.quantity,
        price,
        subtotal,
        added_at: item.added_at,
      };
    });

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0,
    );

    return {
      id: cart.id,
      user_id: cart.user_id,
      session_id: cart.session_id,
      items,
      summary: {
        items_count: items.length,
        total_quantity: items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),
        subtotal: Number(subtotal.toFixed(2)),
        total: Number(subtotal.toFixed(2)), // Can add shipping/tax later
      },
      created_at: cart.created_at,
      updated_at: cart.updated_at,
    };
  }
}
