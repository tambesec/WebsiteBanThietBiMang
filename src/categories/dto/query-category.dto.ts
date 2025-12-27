import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, Min, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO for querying categories with filters
 * Security: All inputs validated
 */
export class QueryCategoryDto {
  @ApiPropertyOptional({
    description: 'Search by category name',
    example: 'điện thoại',
  })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by parent category ID (null for root categories)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Parent ID must be an integer' })
  parent_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1) return true;
    if (value === 'false' || value === false || value === 0) return false;
    return undefined;
  })
  @IsBoolean({ message: 'Active status must be boolean' })
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Include product count for each category',
    example: true,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1)
  @IsBoolean({ message: 'Include products must be boolean' })
  include_products_count?: boolean;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['display_order', 'name', 'created_at'],
    default: 'display_order',
  })
  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  @IsIn(['display_order', 'name', 'created_at'], {
    message: 'Sort by must be one of: display_order, name, created_at',
  })
  sort_by?: 'display_order' | 'name' | 'created_at' = 'display_order';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  @IsIn(['asc', 'desc'], { message: 'Sort order must be asc or desc' })
  sort_order?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number = 50;
}
