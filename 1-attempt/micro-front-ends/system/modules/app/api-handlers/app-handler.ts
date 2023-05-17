import { Get, HttpCode } from 'next-api-decorators';

export class AppHandler {
  @Get()
  @HttpCode(204)
  runHealthCheck(): void {
  }
};
