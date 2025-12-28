import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MomoService } from './momo/momo.service';
import { MomoController } from './momo/momo.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ConfigModule, PrismaModule, EmailModule],
  controllers: [MomoController],
  providers: [MomoService],
  exports: [MomoService],
})
export class PaymentsModule {}
