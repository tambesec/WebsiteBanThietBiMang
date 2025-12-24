import { IsOptional, IsIn, IsInt, Min, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for querying/filtering reviews
 */
export class QueryReviewDto {
  @ApiPropertyOptional({
    description: 'Filter by product ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  product_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  user_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by rating (1-5)',
    example: 5,
    enum: [1, 2, 3, 4, 5],
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Filter by approval status',
    example: 'all',
    enum: ['all', 'approved', 'pending', 'rejected'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['all', 'approved', 'pending', 'rejected'])
  @Transform(({ value }) => value?.toLowerCase())
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by verified purchase',
    example: 'true',
    enum: ['all', 'true', 'false'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['all', 'true', 'false'])
  verified?: string = 'all';

  @ApiPropertyOptional({
    description: 'Search in title and comment',
    example: 'excellent',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'created_at',
    enum: ['created_at', 'rating', 'helpful_count'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'rating', 'helpful_count'])
  sort_by?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  @Transform(({ value }) => value?.toLowerCase())
  sort_order?: string = 'desc';

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
