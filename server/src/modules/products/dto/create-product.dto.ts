import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  MaxLength,
  Min,
  IsNumber,
  IsArray,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 1, description: 'Category ID' })
  @IsInt()
  @Min(1)
  categoryId: number;

  @ApiPropertyOptional({ example: 1, description: 'Brand ID' })
  @IsOptional()
  @IsInt()
  @Min(1)
  brandId?: number;

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

  @ApiPropertyOptional({ example: 'AX3000', description: 'Model number' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  model?: string;

  @ApiPropertyOptional({ example: 'Router WiFi 6 hiệu năng cao', description: 'Short description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  shortDescription?: string;

  @ApiPropertyOptional({
    example: 'High-performance WiFi 6 router with advanced features...',
    description: 'Full product description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: { speed: 'AX3000', ports: '4x Gigabit LAN' },
    description: 'Product specifications as JSON',
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    example: ['wifi6', 'router', 'dual-band'],
    description: 'Product tags',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 2500000, description: 'Base price in VND' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 2200000, description: 'Sale price in VND' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({ example: 50, description: 'Stock quantity' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: true, description: 'Is product active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is product featured' })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
