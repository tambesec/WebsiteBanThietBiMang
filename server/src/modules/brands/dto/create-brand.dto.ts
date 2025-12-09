import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'TP-Link', description: 'Brand name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'tp-link', description: 'URL slug (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  slug?: string;

  @ApiPropertyOptional({
    example: 'Leading network equipment manufacturer',
    description: 'Brand description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/logo.png',
    description: 'Brand logo URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string;

  @ApiPropertyOptional({
    example: 'https://tp-link.com',
    description: 'Brand website URL',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ example: true, description: 'Brand active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
