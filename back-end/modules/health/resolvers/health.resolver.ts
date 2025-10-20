import { HealthStatusPayload } from '@/health/payloads/health-status.payload';
import { IntervalCheckService } from '@/health/services/interval-check.service';
import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class HealthResolver {
  public constructor(private readonly intervalCheckService: IntervalCheckService) {
  }

  @Query((): typeof HealthStatusPayload => {
    return HealthStatusPayload;
  })
  public healthCheck(): Promise<HealthStatusPayload> {
    return this.intervalCheckService.runCheck();
  }
};
