import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Helmet for HTTP headers protection
  app.use(helmet());

  // Performance: Enable compression
  app.use(compression());

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global response transformer
  app.useGlobalInterceptors(new TransformInterceptor());

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
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API docs available at http://localhost:${port}/docs`);
}

bootstrap();
