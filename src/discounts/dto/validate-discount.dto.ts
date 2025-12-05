import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class ValidateDiscountDto {
  @ApiProperty({ example: 'SUMMER2024' })
  @IsString()
  code: string;

  @ApiProperty({ example: 500000, description: 'Order subtotal amount' })
  @IsNumber()
  @Min(0)
  order_amount: number;
}
