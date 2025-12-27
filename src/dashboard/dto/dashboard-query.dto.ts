import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';

export class DashboardQueryDto {
  @ApiProperty({
    description: 'Time period',
    enum: ['today', 'week', 'month', 'year'],
    default: 'month',
    required: false,
  })
  @IsOptional()
  @IsIn(['today', 'week', 'month', 'year'])
  period?: string = 'month';
}
