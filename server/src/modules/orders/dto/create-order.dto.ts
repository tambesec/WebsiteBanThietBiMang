import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'Shipping address ID' })
  @IsInt()
  @Min(1)
  shippingAddressId: number;

  @ApiProperty({ example: 1, description: 'Billing address ID' })
  @IsInt()
  @Min(1)
  billingAddressId: number;

  @ApiProperty({ example: 1, description: 'Payment method ID' })
  @IsInt()
  @Min(1)
  paymentMethodId: number;

  @ApiProperty({ example: 1, description: 'Shipping method ID' })
  @IsInt()
  @Min(1)
  shippingMethodId: number;

  @ApiProperty({
    example: 'SUMMER2024',
    description: 'Discount code',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  discountCode?: string;

  @ApiProperty({
    example: 'Please deliver before 5 PM',
    description: 'Customer note',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  customerNote?: string;
}
