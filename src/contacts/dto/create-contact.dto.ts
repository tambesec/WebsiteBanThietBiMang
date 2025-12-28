import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ description: 'Tên', example: 'Văn A' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString()
  @MaxLength(100)
  first_name: string;

  @ApiProperty({ description: 'Họ', example: 'Nguyễn' })
  @IsNotEmpty({ message: 'Họ không được để trống' })
  @IsString()
  @MaxLength(100)
  last_name: string;

  @ApiPropertyOptional({ description: 'Email', example: 'contact@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0901234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Chủ đề', example: 'Hỏi về sản phẩm' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiProperty({ description: 'Nội dung tin nhắn', example: 'Tôi muốn hỏi về...' })
  @IsNotEmpty({ message: 'Tin nhắn không được để trống' })
  @IsString()
  @MinLength(10, { message: 'Tin nhắn phải có ít nhất 10 ký tự' })
  message: string;
}
