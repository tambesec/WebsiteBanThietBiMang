import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'TP-Link', description: 'Brand name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'tp-link', description: 'URL slug' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  slug: string;

  @ApiProperty({
    example: 'Leading network equipment manufacturer',
    description: 'Brand description',
    required: false,
  })
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'Brand logo URL',
    required: false,
  })
  @IsString()
  @MaxLength(500)
  logoUrl?: string;
}
