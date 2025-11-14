import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 1, description: 'Product item ID (SKU)' })
  @IsInt()
  @Min(1)
  productItemId: number;

  @ApiProperty({ example: 2, description: 'Quantity to add' })
  @IsInt()
  @Min(1)
  quantity: number;
}
