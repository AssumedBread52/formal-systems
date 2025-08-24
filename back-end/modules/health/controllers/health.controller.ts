import { IntervalCheckService } from '@/health/services/interval-check.service';
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  public constructor(private readonly intervalCheckService: IntervalCheckService) {
  }

  @Get()
  @HealthCheck()
  public check(): Promise<HealthCheckResult> {
    return this.intervalCheckService.runCheck();
  }
};
