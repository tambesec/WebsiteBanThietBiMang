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
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

/**
 * Products Controller
 * Handles all product-related HTTP endpoints
 */
@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Create a new product (Admin only)
   */
  @Post()
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation failed or category not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - SKU already exists',
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * Get all products with filters and pagination (Public)
   */
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all products with filters, search, and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category_id', required: false, type: Number })
  @ApiQuery({ name: 'brand', required: false, type: String })
  @ApiQuery({ name: 'min_price', required: false, type: Number })
  @ApiQuery({ name: 'max_price', required: false, type: Number })
  @ApiQuery({ name: 'is_featured', required: false, type: Boolean })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  @ApiQuery({ name: 'sort_by', required: false, enum: ['created_at', 'price', 'name', 'stock_quantity'] })
  @ApiQuery({ name: 'sort_order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  /**
   * Get featured products (Public)
   */
  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured products' })
  @ApiResponse({
    status: 200,
    description: 'Featured products retrieved successfully',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getFeatured(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.productsService.findAll({
      is_featured: true,
      is_active: true,
      limit: limit || 8,
      page: 1,
    });
  }

  /**
   * Get a single product by ID (Public)
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  /**
   * Get a product by slug (Public, SEO-friendly)
   */
  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get a product by slug (SEO-friendly)' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiParam({ name: 'slug', type: String })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  /**
   * Update a product (Admin only)
   */
  @Patch(':id')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - SKU already exists',
  })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * Delete a product - soft delete (Admin only)
   */
  @Delete(':id')
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a product - soft delete (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  /**
   * Toggle featured status (Admin only)
   */
  @Patch(':id/toggle-featured')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle product featured status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Featured status updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiParam({ name: 'id', type: Number })
  toggleFeatured(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.toggleFeatured(id);
  }

  /**
   * Toggle active status (Admin only)
   */
  @Patch(':id/toggle-active')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle product active status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Active status updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiParam({ name: 'id', type: Number })
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.toggleActive(id);
  }

  /**
   * Update stock quantity (Admin only)
   */
  @Patch(':id/stock')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product stock quantity (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Stock updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid stock quantity',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiParam({ name: 'id', type: Number })
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.productsService.updateStock(id, quantity);
  }

  /**
   * Advanced search with relevance scoring (Public)
   */
  @Post('search')
  @Public()
  @ApiOperation({ summary: 'Advanced product search with relevance scoring' })
  @ApiResponse({
    status: 200,
    description: 'Search results with relevance scores',
  })
  advancedSearch(@Body() searchDto: SearchProductDto) {
    return this.productsService.advancedSearch(
      searchDto.query,
      searchDto.fields,
      searchDto.mode,
    );
  }

  /**
   * Get filter options (Public)
   */
  @Get('filters/options')
  @Public()
  @ApiOperation({ summary: 'Get available filter options (brands, price range, categories)' })
  @ApiResponse({
    status: 200,
    description: 'Filter options retrieved successfully',
  })
  getFilterOptions() {
    return this.productsService.getFilterOptions();
  }

  /**
   * Get related products (Public)
   */
  @Get(':id/related')
  @Public()
  @ApiOperation({ summary: 'Get related products by category' })
  @ApiResponse({
    status: 200,
    description: 'Related products retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiParam({ name: 'id', type: Number })
  getRelatedProducts(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getRelatedProducts(id, 4);
  }

  /**
   * Get product suggestions for autocomplete (Public)
   */
  @Get('suggestions/:query')
  @Public()
  @ApiOperation({ summary: 'Get product suggestions for autocomplete' })
  @ApiResponse({
    status: 200,
    description: 'Suggestions retrieved successfully',
  })
  getSuggestions(@Param('query') query: string) {
    return this.productsService.getSuggestions(query, 10);
  }

  /**
   * Compare multiple products (Public)
   */
  @Post('compare')
  @Public()
  @ApiOperation({ summary: 'Compare 2-4 products side by side' })
  @ApiResponse({
    status: 200,
    description: 'Product comparison retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Must compare 2-4 products',
  })
  @ApiResponse({
    status: 404,
    description: 'Some products not found',
  })
  compareProducts(@Body('product_ids') productIds: number[]) {
    return this.productsService.compareProducts(productIds);
  }
}
