import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';

/**
 * Bootstrap the NestJS application
 * Sets up security, validation, logging, and global configurations
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Get configuration service (for non-environment configs only)
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');

  // 🔥 BEST PRACTICE: Use ConfigService which has loaded .env file
  // ConfigModule.forRoot() already loaded .env into ConfigService
  const nodeEnv = configService.get<string>('nodeEnv') || 'development';
  const isProd = nodeEnv === 'production';

  // Security: Helmet middleware
  app.use(helmet());

  // Cookie parser middleware (for reading cookies)
  app.use(cookieParser());

  // Session middleware for cart support
  app.use(
    session({
      secret: configService.get<string>('jwtSecret') || 'networkstore-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: isProd, // Use isProd flag
        sameSite: isProd ? 'none' : 'lax', // 'none' for production (cross-site), 'lax' for dev
      },
    }),
  );

  // CORS Configuration
  // Load allowed origins from environment variable (comma-separated)
  // Example: CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
  const corsOriginsEnv = configService.get<string>('corsOrigins');
  
  let corsOrigins: (string | RegExp)[];
  
  if (isProd && corsOriginsEnv) {
    // Production: Parse from environment variable
    corsOrigins = corsOriginsEnv.split(',').map(origin => origin.trim());
    logger.log(`🔒 CORS enabled for production origins: ${corsOrigins.join(', ')}`);
  } else {
    // Development: Allow localhost and LAN IPs for testing
    corsOrigins = [
      'http://localhost:3001',           // Client frontend
      'http://localhost:3002',           // Admin dashboard
      'http://127.0.0.1:3001',          // Client localhost IP
      'http://127.0.0.1:3002',          // Admin localhost IP
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d{4}$/, // Any LAN IP pattern
    ];
    logger.log('🔓 CORS enabled for development (localhost + LAN IPs)');
  }
  
  app.enableCors({
    origin: corsOrigins,
    credentials: true,                     // Enable HTTP-only cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],        // Expose Set-Cookie header for cookies
    maxAge: 86400,                         // Preflight cache 24h (reduce OPTIONS requests)
  });

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: false, // Disabled to use explicit @Transform decorators
      },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger/OpenAPI Documentation - Only in development
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('NetworkStore API')
      .setDescription('E-commerce API for network equipment store')
      .setVersion('1.0')
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('products', 'Product management')
      .addTag('orders', 'Order management')
      .addTag('cart', 'Shopping cart')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // This name will be used in @ApiBearerAuth()
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      customSiteTitle: 'NetworkStore API Docs',
      customfavIcon: 'https://nestjs.com/img/logo-small.svg',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
      ],
    });
    
    logger.log(`📚 Swagger API docs available at: http://localhost:${port}/api`);
  } else {
    logger.log(`🔒 Swagger disabled in production mode`);
  }

  // Start server
  await app.listen(port || 3000);

  logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger API docs available at: http://localhost:${port}/api`);
  logger.log(`📝 Environment: ${nodeEnv}`);
}

bootstrap();
