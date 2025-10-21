import { HealthStatus } from '@/health/enums/health-status.enum';
import { HealthStatusPayload } from '@/health/payloads/health-status.payload';
import { IntervalCheckService } from '@/health/services/interval-check.service';
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  public constructor(private readonly intervalCheckService: IntervalCheckService) {
  }

  @Get()
  @HealthCheck()
  public async check(): Promise<HealthStatusPayload> {
    const result = await this.intervalCheckService.runCheck();

    const { healthStatus } = result;

    if (HealthStatus.up !== healthStatus) {
      throw new ServiceUnavailableException(result);
    }

    return result;
  }
};
