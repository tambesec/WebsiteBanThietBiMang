import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsDecimal,
  IsOptional,
  IsBoolean,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateProductItemDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ example: 'AX3000-BLK-001', description: 'SKU code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sku: string;

  @ApiProperty({ example: 2990000, description: 'Price in VND' })
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 50, description: 'Quantity in stock', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  qtyInStock?: number;

  @ApiProperty({ example: 0.5, description: 'Weight in kg', required: false })
  @IsOptional()
  weightKg?: number;

  @ApiProperty({ example: 24, description: 'Warranty months', required: false })
  @IsInt()
  @Min(0)
  @Max(120)
  @IsOptional()
  warrantyMonths?: number;

  @ApiProperty({ example: true, description: 'Is item active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
