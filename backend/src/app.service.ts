import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      status: 'online',
      name: 'BitForge API',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
  }
}
