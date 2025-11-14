import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 2, description: 'New order status ID' })
  @IsInt()
  @Min(1)
  statusId: number;

  @ApiProperty({
    example: 'Package shipped via express delivery',
    description: 'Status change note',
    required: false,
  })
  note?: string;
}
