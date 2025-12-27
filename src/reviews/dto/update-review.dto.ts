import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  IsArray,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating a review
 * Users can only update their own reviews
 */
export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Rating from 1 to 5 stars',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Rating must be at least 1 star' })
  @Max(5, { message: 'Rating must be at most 5 stars' })
  @Type(() => Number)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Review title',
    example: 'Great product with minor issues',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Review comment/content',
    example: 'Updated my review after using for a month. Still good overall.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  comment?: string;

  @ApiPropertyOptional({
    description: 'Array of image URLs',
    example: [
      'https://example.com/updated-image1.jpg',
      'https://example.com/updated-image2.jpg',
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
