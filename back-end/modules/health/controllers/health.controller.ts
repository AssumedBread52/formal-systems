import { DatabaseCheckService } from '@/health/services/database-check.service';
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  public constructor(private readonly databaseCheckService: DatabaseCheckService, private readonly healthCheckService: HealthCheckService) {
  }

  @Get()
  @HealthCheck()
  public check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      this.databaseCheckService.check.bind(this.databaseCheckService)
    ]);
  }
};
