import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
}

export class CreateDiscountDto {
  @ApiProperty({ example: 'SUMMER2024', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Summer sale 20% off', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiProperty({ enum: DiscountType, example: 'percentage' })
  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @ApiProperty({ example: 20, description: 'Percentage (1-100) or amount in VND' })
  @IsNumber()
  @Min(0)
  discount_value: number;

  @ApiProperty({ example: 100000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_order_amount?: number;

  @ApiProperty({ example: 500000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_discount_amount?: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  max_uses?: number;

  @ApiProperty({ example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  max_uses_per_user?: number;

  @ApiProperty({ example: '2024-06-01T00:00:00Z' })
  @IsDateString()
  starts_at: string;

  @ApiProperty({ example: '2024-08-31T23:59:59Z' })
  @IsDateString()
  ends_at: string;
}
