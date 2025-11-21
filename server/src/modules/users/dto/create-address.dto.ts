import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  addressLine1: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  addressLine2?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  district: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  ward?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  postalCode: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
