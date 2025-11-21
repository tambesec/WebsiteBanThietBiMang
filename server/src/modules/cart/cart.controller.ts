import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cart')
@Controller('api/v1/cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get current user's cart
   * Security: JWT required, user can only see their own cart
   */
  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({ status: 200, description: 'Returns user cart with items' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.userId);
  }

  /**
   * Add item to cart
   * Security: JWT required, stock validation, prevents over-ordering
   */
  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient stock' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addToCart(@Req() req: any, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, addToCartDto);
  }

  /**
   * Update cart item quantity
   * Security: JWT required, ownership verification, stock validation
   */
  @Put('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'id', description: 'Cart item ID', type: Number })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient stock' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your cart' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateCartItem(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user.userId, id, updateDto);
  }

  /**
   * Remove item from cart
   * Security: JWT required, ownership verification
   */
  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart item ID', type: Number })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your cart' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeCartItem(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.cartService.removeCartItem(req.user.userId, id);
  }

  /**
   * Clear entire cart
   * Security: JWT required, clears only user's own cart
   */
  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.userId);
  }
}
