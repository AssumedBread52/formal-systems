import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { DatabaseService } from './services/database.service';

@Controller('health')
export class HealthController {
  constructor(private databaseService: DatabaseService, private healthCheckService: HealthCheckService) {
  }

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      this.databaseService.check.bind(this.databaseService)
    ]);
  }
};
