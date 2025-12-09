import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  // Enable NestJS logger
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const logger = new Logger('Bootstrap');

  // Security: Helmet for HTTP headers protection
  app.use(helmet());

  // Performance: Enable compression
  app.use(compression());

  // Request logging middleware
  app.use((req: any, res: any, next: any) => {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;

    // Log request
    logger.log(`➡️  ${method} ${originalUrl} - IP: ${ip}`);

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      const statusEmoji = statusCode < 400 ? '✅' : '❌';
      logger.log(`${statusEmoji} ${method} ${originalUrl} - ${statusCode} - ${duration}ms`);
    });

    next();
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Network Store API')
    .setDescription('API documentation for Network Equipment E-commerce Store')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer('http://localhost:5000', 'Development server')
    .addServer('https://api.nettechpro.me', 'Production server')
    .addTag('Health', 'Health check and monitoring endpoints')
    .addTag('Authentication', 'Customer authentication and authorization (JWT)')
    .addTag('Admin', 'Admin authentication and dashboard')
    .addTag('Products', 'Product catalog management and browsing')
    .addTag('Cart', 'Shopping cart management for customers')
    .addTag('Orders', 'Order processing and tracking')
    .addTag('Brands', 'Brand information and product listings')
    .addTag('Categories', 'Category hierarchy and product filtering')
    .addTag('Users', 'User profile and address management')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);

  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(`📚 API docs available at http://localhost:${port}/docs`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
