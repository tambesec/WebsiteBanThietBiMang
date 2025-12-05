import { IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for admin reply to a review
 * Only admins can reply to reviews
 */
export class AdminReplyDto {
  @ApiProperty({
    description: 'Admin reply to the review',
    example: 'Thank you for your feedback! We are glad you enjoyed our product.',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Reply cannot be empty' })
  @MaxLength(1000, { message: 'Reply must not exceed 1000 characters' })
  admin_reply: string;
}
