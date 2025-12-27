import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

/**
 * DTO for advanced product search
 */
export class SearchProductDto {
  @ApiProperty({
    example: 'cisco switch',
    description: 'Search keywords',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    example: ['name', 'description'],
    description: 'Fields to search in',
    enum: ['name', 'description', 'brand', 'model', 'sku'],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  fields?: string[];

  @ApiPropertyOptional({
    example: 'fuzzy',
    description: 'Search mode: exact or fuzzy',
    enum: ['exact', 'fuzzy'],
  })
  @IsString()
  @IsOptional()
  mode?: string = 'fuzzy';
}
