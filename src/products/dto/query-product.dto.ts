import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * DTO for querying products with filters, search, and pagination
 */
export class QueryProductDto {
  @ApiPropertyOptional({
    example: 'switch',
    description: 'Search by product name, brand, or model',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by category ID',
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  category_id?: number;

  @ApiPropertyOptional({
    example: 'Cisco',
    description: 'Filter by brand',
  })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({
    example: 1000000,
    description: 'Minimum price filter',
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  min_price?: number;

  @ApiPropertyOptional({
    example: 20000000,
    description: 'Maximum price filter',
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  max_price?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter featured products only',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    // Convert string to boolean explicitly
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      if (lowerValue === 'true' || lowerValue === '1') return true;
      if (lowerValue === 'false' || lowerValue === '0') return false;
      return undefined;
    }
    // Handle boolean values
    if (typeof value === 'boolean') return value;
    // Handle number values
    if (typeof value === 'number') return value === 1;
    return undefined;
  }, { toClassOnly: true })
  is_featured?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter active products only (default: true)',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return true; // default value
    // Convert string to boolean explicitly
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      if (lowerValue === 'true' || lowerValue === '1') return true;
      if (lowerValue === 'false' || lowerValue === '0') return false;
      return true; // default if invalid string
    }
    // Handle boolean values
    if (typeof value === 'boolean') return value;
    // Handle number values
    if (typeof value === 'number') return value === 1;
    return true; // default value
  }, { toClassOnly: true })
  is_active?: boolean;

  @ApiPropertyOptional({
    example: 'price',
    description: 'Sort by field',
    enum: ['price', 'name', 'created_at', 'stock_quantity'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['price', 'name', 'created_at', 'stock_quantity'])
  sort_by?: string;

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsString()
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort_order?: 'asc' | 'desc';

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Items per page',
    minimum: 1,
    default: 20,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
