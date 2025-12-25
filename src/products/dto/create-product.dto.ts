import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsInt,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new product
 */
export class CreateProductDto {
  @ApiProperty({ example: 1, description: 'Category ID' })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  category_id: number;

  @ApiProperty({
    example: 'Cisco Catalyst 2960-X Series Switch',
    description: 'Product name',
    maxLength: 300,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name: string;

  @ApiPropertyOptional({
    example: 'Cisco',
    description: 'Brand name',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({
    example: 'WS-C2960X-48FPD-L',
    description: 'Model number',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  model?: string;

  @ApiPropertyOptional({
    example: 'High-performance 48-port Gigabit Ethernet switch with PoE+',
    description: 'Product description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 15999000,
    description: 'Product price in VND',
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    example: 18999000,
    description: 'Compare at price (original price before discount)',
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  compare_at_price?: number;

  @ApiProperty({
    example: 'CISCO-C2960X-48FPD',
    description: 'Stock Keeping Unit (unique)',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sku: string;

  @ApiProperty({
    example: 50,
    description: 'Available stock quantity',
    minimum: 0,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  stock_quantity: number;

  @ApiPropertyOptional({
    example: JSON.stringify({
      ports: '48 x 10/100/1000 Ethernet ports',
      poe: 'PoE+ (740W)',
      switching_capacity: '176 Gbps',
      forwarding_rate: '130.9 Mpps',
    }),
    description: 'Product specifications in JSON format',
  })
  @IsString()
  @IsOptional()
  specifications?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/cisco-switch.jpg',
    description: 'Primary product image URL',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  primary_image?: string;

  @ApiPropertyOptional({
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    description: 'Additional product images (array of URLs)',
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  additional_images?: string[];

  @ApiPropertyOptional({
    example: 24,
    description: 'Warranty period in months',
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  warranty_months?: number;

  @ApiPropertyOptional({
    example: 'Cisco Catalyst 2960-X Switch - Best Network Switch',
    description: 'SEO meta title',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  meta_title?: string;

  @ApiPropertyOptional({
    example: 'Buy Cisco Catalyst 2960-X Series Switch with PoE+. High performance, reliable, best price.',
    description: 'SEO meta description',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  meta_description?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Product active status (1 = active, 0 = inactive)',
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  is_active?: number;
}
