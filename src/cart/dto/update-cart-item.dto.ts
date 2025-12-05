import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'New quantity (1-99, or 0 to remove)',
    example: 2,
    minimum: 0,
    maximum: 99,
  })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(0, { message: 'Quantity must be at least 0' })
  @Max(99, { message: 'Quantity cannot exceed 99' })
  @Type(() => Number)
  quantity: number;
}
