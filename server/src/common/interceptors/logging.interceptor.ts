import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip || request.connection?.remoteAddress;

    const now = Date.now();

    // Log request details
    this.logger.log(`📥 Request: ${method} ${url}`);
    this.logger.debug(`   Body: ${JSON.stringify(body)}`);
    this.logger.debug(`   IP: ${ip}`);
    this.logger.debug(`   User-Agent: ${userAgent}`);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - now;

          this.logger.log(`📤 Response: ${method} ${url} - ${statusCode} - ${duration}ms`);
          
          // Log response data in development
          if (process.env.NODE_ENV === 'development') {
            const responsePreview = JSON.stringify(data)?.substring(0, 200);
            this.logger.debug(`   Data: ${responsePreview}...`);
          }
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(`❌ Error: ${method} ${url} - ${error.status || 500} - ${duration}ms`);
          this.logger.error(`   Message: ${error.message}`);
        },
      }),
    );
  }
}


