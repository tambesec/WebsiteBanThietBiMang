import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ContactStatus {
  NEW = 'new',
  READ = 'read',
  REPLIED = 'replied',
  RESOLVED = 'resolved',
  SPAM = 'spam',
}

export class UpdateContactDto {
  @ApiPropertyOptional({ description: 'Trạng thái', enum: ContactStatus })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional({ description: 'Ghi chú của admin' })
  @IsOptional()
  @IsString()
  admin_note?: string;

  @ApiPropertyOptional({ description: 'Đã đọc chưa' })
  @IsOptional()
  is_read?: boolean;
}
