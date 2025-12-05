import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export enum OrderStatus {
  PENDING = 1,
  CONFIRMED = 2,
  PROCESSING = 3,
  SHIPPED = 4,
  DELIVERED = 5,
  CANCELLED = 6,
  RETURNED = 7,
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'New order status ID',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  @IsEnum(OrderStatus, {
    message: 'Status must be one of: 1 (Pending), 2 (Confirmed), 3 (Processing), 4 (Shipped), 5 (Delivered), 6 (Cancelled), 7 (Returned)',
  })
  status_id: OrderStatus;

  @ApiProperty({
    description: 'Note about status change (optional)',
    example: 'Order confirmed and being prepared',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Note must be a string' })
  @MaxLength(1000, { message: 'Note cannot exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  note?: string;
}
