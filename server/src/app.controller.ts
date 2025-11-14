import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  getHealth(): { message: string; timestamp: string } {
    return this.appService.getHealth();
  }

  @Get('api')
  @ApiOperation({ summary: 'API info' })
  getApiInfo() {
    return this.appService.getApiInfo();
  }
}
