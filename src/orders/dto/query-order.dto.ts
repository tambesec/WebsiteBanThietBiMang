import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsEnum, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum OrderQueryStatus {
  ALL = 'all',
  PENDING = '1',
  CONFIRMED = '2',
  PROCESSING = '3',
  SHIPPED = '4',
  DELIVERED = '5',
  CANCELLED = '6',
  RETURNED = '7',
}

export enum OrderSortBy {
  CREATED_AT = 'created_at',
  TOTAL_AMOUNT = 'total_amount',
  ORDER_NUMBER = 'order_number',
}

export class QueryOrderDto {
  @ApiProperty({
    description: 'Filter by order status',
    enum: OrderQueryStatus,
    example: OrderQueryStatus.ALL,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderQueryStatus, {
    message: 'Status must be one of: all, 1-7',
  })
  status?: OrderQueryStatus;

  @ApiProperty({
    description: 'Search by order number, customer name, email',
    example: 'ORD-2025',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiProperty({
    description: 'Sort by field',
    enum: OrderSortBy,
    example: OrderSortBy.CREATED_AT,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderSortBy)
  sort_by?: OrderSortBy;

  @ApiProperty({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
    required: false,
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort_order?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Page number',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  limit?: number = 20;
}
