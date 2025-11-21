import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty()
  @IsInt()
  productId: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}
