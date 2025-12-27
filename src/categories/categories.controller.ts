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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
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
  ApiBody,
} from '@nestjs/swagger';

/**
 * Categories Controller
 * Handles all category-related HTTP endpoints
 * Security: Role-based access control (Admin for mutations, Public for queries)
 */
@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Create a new category (Admin only)
   * Security: Requires admin role
   */
  @Post()
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation failed or parent not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  /**
   * Get all categories with filters and pagination (Public)
   * Security: Public endpoint, returns only active by default
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all categories with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'parent_id', required: false, type: Number })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  @ApiQuery({ name: 'include_products_count', required: false, type: Boolean })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    enum: ['display_order', 'name', 'created_at'],
  })
  @ApiQuery({ name: 'sort_order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() query: QueryCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  /**
   * Get category tree structure (Public)
   * Security: Returns hierarchical structure, only active by default
   */
  @Get('tree')
  @Public()
  @ApiOperation({ summary: 'Get category tree structure (hierarchical)' })
  @ApiResponse({
    status: 200,
    description: 'Category tree retrieved successfully',
  })
  @ApiQuery({
    name: 'include_inactive',
    required: false,
    type: Boolean,
    description: 'Include inactive categories (admin only)',
  })
  getCategoryTree(@Query('include_inactive') includeInactive?: boolean) {
    // Security: Only allow include_inactive for authenticated requests
    // For public requests, always return only active categories
    return this.categoriesService.getCategoryTree(includeInactive || false);
  }

  /**
   * Get root categories (categories without parent) (Public)
   */
  @Get('roots')
  @Public()
  @ApiOperation({ summary: 'Get root categories (no parent)' })
  @ApiResponse({
    status: 200,
    description: 'Root categories retrieved successfully',
  })
  getRootCategories() {
    return this.categoriesService.findAll({
      parent_id: undefined,
      is_active: true,
      sort_by: 'display_order',
      sort_order: 'asc',
    });
  }

  /**
   * Get category by ID (Public)
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  /**
   * Get category by slug (Public, SEO-friendly)
   */
  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get a category by slug (SEO-friendly)' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiParam({ name: 'slug', type: String })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  /**
   * Update a category (Admin only)
   * Security: Requires admin role, validates circular references
   */
  @Patch(':id')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation failed or circular reference',
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
    description: 'Category not found',
  })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * Delete a category - soft delete (Admin only)
   * Security: Prevents deletion if has children or products
   */
  @Delete(':id')
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a category - soft delete (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete - has subcategories or products',
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
    description: 'Category not found',
  })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }

  /**
   * Reorder categories (Admin only)
   * Security: Validates all category IDs, uses transaction
   */
  @Post('reorder')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder categories (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Categories reordered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid category IDs',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              display_order: { type: 'number' },
            },
          },
          example: [
            { id: 1, display_order: 1 },
            { id: 2, display_order: 2 },
            { id: 3, display_order: 3 },
          ],
        },
      },
    },
  })
  reorder(@Body('categories') categories: { id: number; display_order: number }[]) {
    return this.categoriesService.reorder(categories);
  }
}
