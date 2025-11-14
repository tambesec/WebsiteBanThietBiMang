import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { Public } from '../../common/decorators';

@ApiTags('Brands')
@Controller('api/brands')
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
   * Get brand by name with products (public)
   */
  @Get(':name')
  @Public()
  @ApiOperation({ summary: 'Get brand by name' })
  @ApiParam({ name: 'name', description: 'Brand name', type: String })
  @ApiResponse({ status: 200, description: 'Returns brand details with products' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async findOne(@Param('name') name: string) {
    return this.brandsService.findOne(name);
  }
}
