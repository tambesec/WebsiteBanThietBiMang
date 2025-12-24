import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AdminReplyDto } from './dto/admin-reply.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or product not purchased',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User already reviewed this product',
  })
  @ApiBearerAuth()
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all reviews with filters' })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
  })
  findAll(@Query() query: QueryReviewDto) {
    return this.reviewsService.findAll(query);
  }

  @Get('admin/all')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all reviews (Admin - including pending)' })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
  })
  @ApiBearerAuth()
  findAllAdmin(@Query() query: QueryReviewDto) {
    return this.reviewsService.findAll(query, true); // Pass isAdmin flag
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review found',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update review (owner only)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the review owner',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(+id, req.user.id, updateReviewDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete review (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 204,
    description: 'Review deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the review owner or admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiBearerAuth()
  remove(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.role_id === 1;
    return this.reviewsService.remove(+id, req.user.id, isAdmin);
  }

  @Post(':id/helpful')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark review as helpful' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review marked as helpful',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiBearerAuth()
  markHelpful(@Param('id') id: string) {
    return this.reviewsService.markHelpful(+id);
  }

  @Post(':id/approve')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve review (admin only)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review approved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Review already approved',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiBearerAuth()
  approve(@Param('id') id: string) {
    return this.reviewsService.approve(+id);
  }

  @Post(':id/reject')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject review (admin only)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review rejected successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiBearerAuth()
  reject(@Param('id') id: string) {
    return this.reviewsService.reject(+id);
  }

  @Post(':id/reply')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add admin reply to review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Reply added successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiBearerAuth()
  addReply(
    @Param('id') id: string,
    @Request() req,
    @Body() replyDto: AdminReplyDto,
  ) {
    return this.reviewsService.addReply(+id, req.user.id, replyDto);
  }

  @Get('products/:productId/stats')
  @Public()
  @ApiOperation({ summary: 'Get product rating statistics' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product rating statistics',
  })
  getProductStats(@Param('productId') productId: string) {
    return this.reviewsService.getProductStats(+productId);
  }
}
