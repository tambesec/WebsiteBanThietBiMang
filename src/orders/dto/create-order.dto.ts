import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsOptional,
  MaxLength,
  IsEnum,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum PaymentMethod {
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
  VNPAY = 'vnpay',
}

export enum ShippingMethod {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Shipping address ID (from user addresses)',
    example: 1,
  })
  @IsInt({ message: 'Shipping address ID must be an integer' })
  @IsPositive({ message: 'Shipping address ID must be positive' })
  @IsNotEmpty({ message: 'Shipping address is required' })
  shipping_address_id: number;

  @ApiProperty({
    description: 'Billing address ID (optional, defaults to shipping)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Billing address ID must be an integer' })
  @IsPositive({ message: 'Billing address ID must be positive' })
  billing_address_id?: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.COD,
  })
  @IsEnum(PaymentMethod, {
    message: 'Payment method must be one of: cod, bank_transfer, momo, zalopay, vnpay',
  })
  @IsNotEmpty({ message: 'Payment method is required' })
  payment_method: PaymentMethod;

  @ApiProperty({
    description: 'Shipping method',
    enum: ShippingMethod,
    example: ShippingMethod.STANDARD,
  })
  @IsEnum(ShippingMethod, {
    message: 'Shipping method must be one of: standard, express, same_day',
  })
  @IsNotEmpty({ message: 'Shipping method is required' })
  shipping_method: ShippingMethod;

  @ApiProperty({
    description: 'Customer phone (override from address if needed)',
    example: '0901234567',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(
    /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/,
    {
      message: 'Invalid Vietnamese phone number format',
    },
  )
  customer_phone?: string;

  @ApiProperty({
    description: 'Discount code (optional)',
    example: 'SUMMER2025',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Discount code must be a string' })
  @MaxLength(50, { message: 'Discount code cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  discount_code?: string;

  @ApiProperty({
    description: 'Customer note (optional)',
    example: 'Please deliver after 5 PM',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Customer note must be a string' })
  @MaxLength(1000, { message: 'Customer note cannot exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  customer_note?: string;
}
