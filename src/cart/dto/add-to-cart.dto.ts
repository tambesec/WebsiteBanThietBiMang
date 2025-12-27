import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsPositive,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @ApiProperty({
    description: 'ID of the product to add to cart',
    example: 1,
    minimum: 1,
  })
  @IsInt({ message: 'Product ID must be an integer' })
  @IsPositive({ message: 'Product ID must be positive' })
  @IsNotEmpty({ message: 'Product ID is required' })
  @Type(() => Number)
  product_id: number;

  @ApiProperty({
    description: 'Quantity to add (1-99)',
    example: 1,
    minimum: 1,
    maximum: 99,
    default: 1,
  })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(99, { message: 'Quantity cannot exceed 99' })
  @Type(() => Number)
  quantity: number = 1;
}
