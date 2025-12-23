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
  Logger,
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
   * Protected endpoint - requires authentication
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current cart',
    description:
      'Retrieve current cart for authenticated user. Returns null if no cart exists.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully or null if no cart exists',
    schema: {
      oneOf: [
        {
          type: 'object',
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
        {
          type: 'null',
          example: null,
        },
      ],
    },
  })
  async getCart(@Request() req, @Session() session) {
    const userId = req.user.id;
    const sessionId = session.id || session.sessionID;

    this.logger.log(`[getCart] User ${userId} requesting cart`);
    return this.cartService.getCart(userId, sessionId);
  }

  /**
   * Add product to cart
   * Protected endpoint - requires authentication
   */
  @Post('items')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add product to cart',
    description:
      'Add a product to cart or increase quantity if already exists. Requires authentication. Validates stock availability.',
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
    status: 401,
    description: 'Unauthorized - Authentication required',
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
    // Now req.user is guaranteed to be defined (JwtAuthGuard)
    const userId = req.user.id;
    const sessionId = session.id || session.sessionID;

    this.logger.log(`[addToCart] User ${userId} adding product ${dto.product_id}`);
    return this.cartService.addToCart(dto, userId, sessionId);
  }

  private readonly logger = new Logger(CartController.name);

  /**
   * Update cart item quantity
   * Protected endpoint - requires authentication
   */
  @Patch('items/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update cart item quantity',
    description:
      'Update quantity of existing cart item. Validates stock and ownership.',
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
    description: 'Bad request - Insufficient stock or invalid quantity',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
  })
  async updateCartItem(
    @Param('id', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
    @Request() req,
    @Session() session,
  ) {
    const userId = req.user.id;
    const sessionId = session.id || session.sessionID;

    return this.cartService.updateCartItem(itemId, dto, userId, sessionId);
  }

  /**
   * Remove item from cart
   * Protected endpoint - requires authentication
   */
  @Delete('items/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove item from cart',
    description: 'Remove a specific item from cart by item ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Cart item ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Item removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
  })
  async removeCartItem(
    @Param('id', ParseIntPipe) itemId: number,
    @Request() req,
    @Session() session,
  ) {
    const userId = req.user.id;
    const sessionId = session.id || session.sessionID;

    return this.cartService.removeCartItem(itemId, userId, sessionId);
  }

  /**
   * Clear all items from cart
   * Protected endpoint - requires authentication
   */
  @Delete()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear cart',
    description: 'Remove all items from current cart.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully',
  })
  async clearCart(@Request() req, @Session() session) {
    const userId = req.user.id;
    const sessionId = session.id || session.sessionID;

    await this.cartService.clearCart(userId, sessionId);

    return {
      message: 'Cart cleared successfully',
    };
  }

  /**
   * Validate cart before checkout
   * Protected endpoint - requires authentication
   */
  @Get('validate')
  @ApiBearerAuth()
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
    const userId = req.user.id;
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
