import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * Email Module
 * Global module for email functionality
 */
@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
