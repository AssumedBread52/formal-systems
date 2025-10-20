import { HealthStatusPayload } from '@/health/payloads/health-status.payload';
import { Injectable } from '@nestjs/common';
import { DatabaseCheckService } from './database-check.service';

@Injectable()
export class IntervalCheckService {
  public constructor(private readonly databaseCheckService: DatabaseCheckService) {
  }

  public async runCheck(): Promise<HealthStatusPayload> {
    const results = await Promise.all([
      this.databaseCheckService.check()
    ]);

    return new HealthStatusPayload(results);
  }
};
