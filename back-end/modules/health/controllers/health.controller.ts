import { DatabaseCheckService } from '@/health/services/database-check.service';
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';

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
