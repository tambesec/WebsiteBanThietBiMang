import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  IsArray,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a product review
 * Only customers who purchased the product can create reviews
 */
export class CreateReviewDto {
  @ApiProperty({
    description: 'Product ID to review',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  product_id: number;

  @ApiPropertyOptional({
    description: 'Order ID (for verified purchase)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  order_id?: number;

  @ApiProperty({
    description: 'Rating from 1 to 5 stars',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1, { message: 'Rating must be at least 1 star' })
  @Max(5, { message: 'Rating must be at most 5 stars' })
  @Type(() => Number)
  rating: number;

  @ApiPropertyOptional({
    description: 'Review title',
    example: 'Excellent product!',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Review comment/content',
    example: 'This product exceeded my expectations. Quality is amazing!',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  comment?: string;

  @ApiPropertyOptional({
    description: 'Array of image URLs',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    type: [String],
    maxItems: 5,
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
  @MaxLength(500, {
    each: true,
    message: 'Each image URL must not exceed 500 characters',
  })
  images?: string[];
}
