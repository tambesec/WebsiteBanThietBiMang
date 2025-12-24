import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

/**
 * DTO for updating user status (block/unblock)
 */
export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'Account status: true = active, false = inactive',
    example: true,
  })
  @IsBoolean()
  is_active: boolean;
}
