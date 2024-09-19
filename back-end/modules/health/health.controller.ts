import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { DatabaseCheckService } from './services/database-check.service';

@Controller('health')
export class HealthController {
  constructor(private databaseCheckService: DatabaseCheckService, private healthCheckService: HealthCheckService) {
  }

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      this.databaseCheckService.check.bind(this.databaseCheckService)
    ]);
  }
};
