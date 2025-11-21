import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, CreateAddressDto, CreateReviewDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user profile
   */
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.sub);
  }

  /**
   * Update user profile
   */
  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@Request() req, @Body() updateDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, updateDto);
  }

  /**
   * Get user addresses
   */
  @Get('addresses')
  @ApiOperation({ summary: 'Get user addresses' })
  @ApiResponse({ status: 200, description: 'Returns user addresses' })
  async getAddresses(@Request() req) {
    return this.usersService.getAddresses(req.user.sub);
  }

  /**
   * Create new address
   */
  @Post('addresses')
  @ApiOperation({ summary: 'Create new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  async createAddress(@Request() req, @Body() createDto: CreateAddressDto) {
    return this.usersService.createAddress(req.user.sub, createDto);
  }

  /**
   * Update address
   */
  @Put('addresses/:id')
  @ApiOperation({ summary: 'Update address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  async updateAddress(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: CreateAddressDto,
  ) {
    return this.usersService.updateAddress(req.user.sub, id, updateDto);
  }

  /**
   * Delete address
   */
  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  async deleteAddress(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteAddress(req.user.sub, id);
  }

  /**
   * Get user orders
   */
  @Get('orders')
  @ApiOperation({ summary: 'Get user orders' })
  @ApiResponse({ status: 200, description: 'Returns user orders' })
  async getOrders(@Request() req) {
    return this.usersService.getOrders(req.user.sub);
  }

  /**
   * Get order details
   */
  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order details' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Returns order details' })
  async getOrderDetails(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.getOrderDetails(req.user.sub, id);
  }

  /**
   * Create product review
   */
  @Post('reviews')
  @ApiOperation({ summary: 'Create product review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async createReview(@Request() req, @Body() createDto: CreateReviewDto) {
    return this.usersService.createReview(req.user.sub, createDto);
  }

  /**
   * Get user reviews
   */
  @Get('reviews')
  @ApiOperation({ summary: 'Get user reviews' })
  @ApiResponse({ status: 200, description: 'Returns user reviews' })
  async getReviews(@Request() req) {
    return this.usersService.getReviews(req.user.sub);
  }
}
