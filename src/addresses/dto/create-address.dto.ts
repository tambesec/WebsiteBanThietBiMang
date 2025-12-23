import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsEnum,
  IsOptional,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum AddressType {
  HOME = 'home',
  OFFICE = 'office',
  OTHER = 'other',
}

export class CreateAddressDto {
  @ApiProperty({
    description: 'Recipient name',
    example: 'Nguyễn Văn A',
    maxLength: 150,
    minLength: 2,
  })
  @IsString({ message: 'Recipient name must be a string' })
  @IsNotEmpty({ message: 'Recipient name is required' })
  @MinLength(2, { message: 'Recipient name must be at least 2 characters' })
  @MaxLength(150, { message: 'Recipient name cannot exceed 150 characters' })
  @Transform(({ value }) => value?.trim())
  recipient_name: string;

  @ApiProperty({
    description: 'Phone number (Vietnamese format)',
    example: '0901234567',
    pattern: '^(0|\\+84)(\\s|\\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\\d)(\\s|\\.)?(\\d{3})(\\s|\\.)?(\\d{3})$',
  })
  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone is required' })
  @Matches(
    /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/,
    {
      message: 'Invalid Vietnamese phone number format',
    },
  )
  @Transform(({ value }) => value?.replace(/\s/g, ''))
  phone: string;

  @ApiProperty({
    description: 'Full address line (street, building, etc.)',
    example: '123 Nguyễn Huệ, Phường Bến Nghé',
    maxLength: 500,
  })
  @IsString({ message: 'Address line must be a string' })
  @IsNotEmpty({ message: 'Address line is required' })
  @MaxLength(500, { message: 'Address line cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  address_line: string;

  @ApiProperty({
    description: 'City/Province',
    example: 'Hồ Chí Minh',
    maxLength: 100,
  })
  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City is required' })
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  city: string;

  @ApiProperty({
    description: 'District (optional)',
    example: 'Quận 1',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'District must be a string' })
  @MaxLength(100, { message: 'District cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  district?: string;

  @ApiProperty({
    description: 'Ward/Commune (optional)',
    example: 'Phường Bến Nghé',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ward must be a string' })
  @MaxLength(100, { message: 'Ward cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  ward?: string;

  @ApiProperty({
    description: 'Postal code (optional, 5-10 digits)',
    example: '700000',
    pattern: '^[0-9]{5,10}$',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  @Matches(/^[0-9]{5,10}$/, {
    message: 'Postal code must be 5-10 digits',
  })
  @Transform(({ value }) => value?.trim())
  postal_code?: string;

  @ApiProperty({
    description: 'Address type',
    enum: AddressType,
    example: AddressType.HOME,
    default: AddressType.HOME,
  })
  @IsOptional()
  @IsEnum(AddressType, {
    message: 'Address type must be one of: home, office, other',
  })
  address_type?: AddressType;
}
