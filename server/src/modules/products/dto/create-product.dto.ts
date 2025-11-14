import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 1, description: 'Category ID' })
  @IsInt()
  @Min(1)
  categoryId: number;

  @ApiProperty({ example: 'TP-Link Archer AX3000', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name: string;

  @ApiProperty({ example: 'tp-link-archer-ax3000', description: 'URL slug' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(350)
  slug: string;

  @ApiProperty({ example: 'TP-Link', description: 'Brand name', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @ApiProperty({ example: 'AX3000', description: 'Model number', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  model?: string;

  @ApiProperty({
    example: 'High-performance WiFi 6 router',
    description: 'Product description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: true, description: 'Is product active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
