import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators';

@ApiTags('Health')
@Controller('api/v1/health')
export class HealthController {
  private readonly startTime: Date = new Date();

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', description: 'Uptime in seconds' },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'development' },
      }
    }
  })
  check() {
    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('ping')
  @Public()
  @ApiOperation({ summary: 'Simple ping endpoint' })
  @ApiResponse({ status: 200, description: 'Pong response' })
  ping() {
    return { message: 'pong', timestamp: new Date().toISOString() };
  }
}
