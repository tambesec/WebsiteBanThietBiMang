import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MaxLength, IsNotEmpty, Matches } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên người nhận' })
  @IsString()
  @IsNotEmpty({ message: 'Tên người nhận không được để trống' })
  @MaxLength(100)
  recipientName: string;

  @ApiProperty({ example: '0901234567', description: 'Số điện thoại người nhận' })
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^[0-9]{10,11}$/, { message: 'Số điện thoại không hợp lệ' })
  phone: string;

  @ApiProperty({ example: '123 Đường ABC', description: 'Địa chỉ chi tiết' })
  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @MaxLength(500)
  streetAddress: string;

  @ApiPropertyOptional({ example: 'Phường 1', description: 'Phường/Xã' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  ward?: string;

  @ApiPropertyOptional({ example: 'Quận 1', description: 'Quận/Huyện' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string;

  @ApiProperty({ example: 'Hồ Chí Minh', description: 'Tỉnh/Thành phố' })
  @IsString()
  @IsNotEmpty({ message: 'Thành phố không được để trống' })
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ example: 'Miền Nam', description: 'Vùng/Miền' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  region?: string;

  @ApiPropertyOptional({ example: '70000', description: 'Mã bưu điện' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ example: 'Việt Nam', description: 'Quốc gia', default: 'Việt Nam' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 'shipping', description: 'Loại địa chỉ: shipping | billing' })
  @IsString()
  @IsOptional()
  addressType?: 'shipping' | 'billing';

  @ApiPropertyOptional({ example: false, description: 'Đặt làm địa chỉ mặc định' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
