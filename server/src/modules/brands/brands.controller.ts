import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto';
import { Public } from '../../common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';

@ApiTags('Brands')
@Controller('api/v1/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  /**
   * Get all brands (public)
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all brands' })
  @ApiResponse({ status: 200, description: 'Returns all brands with product count' })
  async findAll() {
    return this.brandsService.findAll();
  }

  /**
   * Get brand by ID (public)
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiParam({ name: 'id', description: 'Brand ID', type: Number })
  @ApiResponse({ status: 200, description: 'Returns brand details' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.findOne(id);
  }

  /**
   * Get brand by slug with products (public)
   */
  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get brand by slug with products' })
  @ApiParam({ name: 'slug', description: 'Brand slug', type: String })
  @ApiResponse({ status: 200, description: 'Returns brand details with products' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }
}

// Admin Brand Controller
@ApiTags('Admin Brands')
@Controller('api/v1/admin/brands')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth()
export class AdminBrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  /**
   * Get all brands (Admin)
   */
  @Get()
  @ApiOperation({ summary: 'Get all brands (Admin)' })
  @ApiResponse({ status: 200, description: 'Returns all brands' })
  async findAll() {
    return this.brandsService.findAll();
  }

  /**
   * Get brand by ID (Admin)
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get brand by ID (Admin)' })
  @ApiParam({ name: 'id', description: 'Brand ID', type: Number })
  @ApiResponse({ status: 200, description: 'Returns brand details' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.findOne(id);
  }

  /**
   * Create new brand (Admin)
   */
  @Post()
  @ApiOperation({ summary: 'Create new brand' })
  @ApiResponse({ status: 201, description: 'Brand created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  /**
   * Update brand (Admin)
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update brand' })
  @ApiParam({ name: 'id', description: 'Brand ID', type: Number })
  @ApiResponse({ status: 200, description: 'Brand updated successfully' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(id, dto);
  }

  /**
   * Delete brand (Admin)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete brand' })
  @ApiParam({ name: 'id', description: 'Brand ID', type: Number })
  @ApiResponse({ status: 200, description: 'Brand deleted successfully' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.remove(id);
  }

  /**
   * Toggle brand active status (Admin)
   */
  @Put(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle brand active status' })
  @ApiParam({ name: 'id', description: 'Brand ID', type: Number })
  @ApiResponse({ status: 200, description: 'Brand status toggled' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.toggleActive(id);
  }
}
