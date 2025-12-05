import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Session,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get current cart
   * Public endpoint - works for both authenticated and guest users
   */
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get current cart',
    description:
      'Retrieve current cart for authenticated user or guest session. Returns empty cart if none exists.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    schema: {
      example: {
        id: 1,
        user_id: 1,
        session_id: 'abc123',
        items: [
          {
            id: 1,
            product: {
              id: 1,
              name: 'iPhone 15 Pro',
              slug: 'iphone-15-pro',
              price: 29990000,
              compare_at_price: 27990000,
              stock_quantity: 50,
              primary_image: 'https://example.com/iphone.jpg',
              is_active: 1,
            },
            quantity: 2,
            price: 27990000,
            subtotal: 55980000,
            added_at: '2025-12-04T10:30:00.000Z',
          },
        ],
        summary: {
          items_count: 1,
          total_quantity: 2,
          subtotal: 55980000,
          total: 55980000,
        },
        created_at: '2025-12-01T08:00:00.000Z',
        updated_at: '2025-12-04T10:30:00.000Z',
      },
    },
  })
  async getCart(@Request() req, @Session() session) {
    const userId = req.user?.id;
    const sessionId = session.id || session.sessionID;

    return this.cartService.getOrCreateCart(userId, sessionId);
  }

  /**
   * Add product to cart
   * Public endpoint - works for both authenticated and guest users
   */
  @Post('items')
  @Public()
  @ApiOperation({
    summary: 'Add product to cart',
    description:
      'Add a product to cart or increase quantity if already exists. Validates stock availability.',
  })
  @ApiResponse({
    status: 201,
    description: 'Product added to cart successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data, insufficient stock, or product unavailable',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async addToCart(
    @Body() dto: AddToCartDto,
    @Request() req,
    @Session() session,
  ) {
    const userId = req.user?.id;
    const sessionId = session.id || session.sessionID;

    return this.cartService.addToCart(dto, userId, sessionId);
  }

  /**
   * Update cart item quantity
   * Public endpoint - validates ownership
   */
  @Patch('items/:id')
  @Public()
  @ApiOperation({
    summary: 'Update cart item quantity',
    description:
      'Update quantity of a cart item. Set quantity to 0 to remove item. Validates stock availability and ownership.',
  })
  @ApiParam({
    name: 'id',
    description: 'Cart item ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid quantity or insufficient stock',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not owner of this cart item',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
  })
  async updateCartItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
    @Request() req,
    @Session() session,
  ) {
    const userId = req.user?.id;
    const sessionId = session.id || session.sessionID;

    return this.cartService.updateCartItem(id, dto, userId, sessionId);
  }

  /**
   * Remove item from cart
   * Public endpoint - validates ownership
   */
  @Delete('items/:id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove item from cart',
    description:
      'Remove a specific item from cart. Validates ownership.',
  })
  @ApiParam({
    name: 'id',
    description: 'Cart item ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart successfully',
    schema: {
      example: {
        message: 'Item removed from cart successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Not owner of this cart item',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
  })
  async removeCartItem(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Session() session,
  ) {
    const userId = req.user?.id;
    const sessionId = session.id || session.sessionID;

    await this.cartService.removeCartItem(id, userId, sessionId);

    return {
      message: 'Item removed from cart successfully',
    };
  }

  /**
   * Clear entire cart
   * Public endpoint - validates ownership
   */
  @Delete()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear cart',
    description: 'Remove all items from cart.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully',
    schema: {
      example: {
        message: 'Cart cleared successfully',
      },
    },
  })
  async clearCart(@Request() req, @Session() session) {
    const userId = req.user?.id;
    const sessionId = session.id || session.sessionID;

    await this.cartService.clearCart(userId, sessionId);

    return {
      message: 'Cart cleared successfully',
    };
  }

  /**
   * Validate cart before checkout
   * Public endpoint - checks product availability and stock
   */
  @Get('validate')
  @Public()
  @ApiOperation({
    summary: 'Validate cart',
    description:
      'Validate cart items before checkout. Checks product availability, stock, and price changes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    schema: {
      example: {
        valid: true,
        errors: [],
        cart: {
          id: 1,
          items: [],
          summary: {},
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Cart is empty',
  })
  async validateCart(@Request() req, @Session() session) {
    const userId = req.user?.id;
    const sessionId = session.id || session.sessionID;

    return this.cartService.validateCart(userId, sessionId);
  }

  /**
   * Merge guest cart into user cart
   * Protected endpoint - requires authentication
   * Called automatically after login by auth service
   */
  @Post('merge')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Merge guest cart into user cart',
    description:
      'Merge guest session cart into authenticated user cart after login. Called automatically by auth service.',
  })
  @ApiResponse({
    status: 200,
    description: 'Carts merged successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async mergeCart(@Request() req, @Session() session) {
    const userId = req.user.id;
    const sessionId = session.id || session.sessionID;

    return this.cartService.mergeGuestCart(userId, sessionId);
  }
}
