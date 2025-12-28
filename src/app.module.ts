import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { AddressesModule } from './addresses/addresses.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { DiscountsModule } from './discounts/discounts.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { ContactsModule } from './contacts/contacts.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import configuration from './config/configuration';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

/**
 * Root Application Module
 * Imports all feature modules and sets up global configuration
 */
@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // Rate Limiting (10 requests per 60 seconds per IP)
    ThrottlerModule.forRoot([{
      ttl: 60000, // Time to live in milliseconds
      limit: 10,  // Max requests per TTL
    }]),

    // Database
    PrismaModule,

    // Email (Global)
    EmailModule,

    // Feature Modules
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    AddressesModule,
    OrdersModule,
    ReviewsModule,
    DiscountsModule,
    DashboardModule,
    UsersModule,
    PaymentsModule,
    ContactsModule,
    NewsletterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply JWT Guard globally (can be overridden by @Public() decorator)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
