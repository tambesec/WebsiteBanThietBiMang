import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * DTO for updating admin profile
 * SECURITY: Admin can only update limited fields
 * - Cannot change email (authentication identifier)
 * - Cannot change role (privilege escalation)
 * - Cannot change account status
 */
export class UpdateAdminProfileDto {
  @ApiProperty({
    description: 'Full name of the admin',
    example: 'Nguyễn Văn A',
    minLength: 2,
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(150, { message: 'Full name must not exceed 150 characters' })
  full_name?: string;

  @ApiProperty({
    description: 'Phone number (10-20 digits)',
    example: '0987654321',
    pattern: '^[0-9]{10,20}$',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,20}$/, { message: 'Phone number must be 10-20 digits' })
  phone?: string;
}
