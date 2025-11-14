import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsInt, IsString, MaxLength, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Routers', description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'routers', description: 'URL slug' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  slug: string;

  @ApiProperty({
    example: 1,
    description: 'Parent category ID',
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  parentId?: number;
}
