import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, IsIn } from 'class-validator';
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

  @ApiProperty({
    description: 'Tracking number for shipping (optional)',
    example: 'GHTK123456789',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Tracking number must be a string' })
  @MaxLength(100, { message: 'Tracking number cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  tracking_number?: string;

  @ApiProperty({
    description: 'Payment status (optional)',
    enum: ['paid', 'unpaid', 'pending', 'refunded'],
    example: 'paid',
    required: false,
  })
  @IsOptional()
  @IsIn(['paid', 'unpaid', 'pending', 'refunded'], {
    message: 'Payment status must be one of: paid, unpaid, pending, refunded',
  })
  payment_status?: 'paid' | 'unpaid' | 'pending' | 'refunded';

  @ApiProperty({
    description: 'Admin internal notes (optional)',
    example: 'Customer requested express delivery',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Admin notes must be a string' })
  @MaxLength(2000, { message: 'Admin notes cannot exceed 2000 characters' })
  @Transform(({ value }) => value?.trim())
  admin_note?: string;
}
