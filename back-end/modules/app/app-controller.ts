import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('app')
export class AppController {
  @Get('health-check')
  @HttpCode(HttpStatus.NO_CONTENT)
  getHealthCheck(): void {
  }
};
