import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 3, description: 'New quantity' })
  @IsInt()
  @Min(1)
  quantity: number;
}
