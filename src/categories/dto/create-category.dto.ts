import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  MaxLength,
  MinLength,
  Min,
  IsUrl,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO for creating a new category
 * Security: All inputs validated and sanitized
 */
export class CreateCategoryDto {
  @ApiPropertyOptional({
    description: 'Parent category ID for nested categories (null for root level)',
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Parent ID must be an integer' })
  @Min(1, { message: 'Parent ID must be positive' })
  parent_id?: number;

  @ApiProperty({
    description: 'Category name',
    example: 'Điện thoại thông minh',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim()) // Security: Trim whitespace
  name: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Các dòng điện thoại thông minh cao cấp',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: 'Category image URL',
    example: 'https://example.com/categories/smartphones.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  @MaxLength(500, { message: 'Image URL must not exceed 500 characters' })
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Display order (lower number = higher priority)',
    example: 1,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Display order must be an integer' })
  @Min(0, { message: 'Display order must be non-negative' })
  display_order?: number;

  @ApiPropertyOptional({
    description: 'Whether category is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active status must be boolean' })
  @Transform(({ value }) => value === true || value === 'true' || value === 1)
  is_active?: boolean;
}
