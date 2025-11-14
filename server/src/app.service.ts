import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    };
  }

  getApiInfo() {
    return {
      name: 'Network Store API',
      version: '1.0.0',
      description: 'Backend API for Network Equipment E-commerce Store',
      docs: '/docs',
    };
  }
}
