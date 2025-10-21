import { HealthStatusPayload } from '@/health/payloads/health-status.payload';
import { Injectable } from '@nestjs/common';
import { DatabaseCheckService } from './database-check.service';
import { FileCheckService } from './file-check.service';

@Injectable()
export class IntervalCheckService {
  public constructor(private readonly databaseCheckService: DatabaseCheckService, private readonly fileCheckService: FileCheckService) {
  }

  public async runCheck(): Promise<HealthStatusPayload> {
    const results = await Promise.all([
      this.databaseCheckService.check(),
      this.fileCheckService.check()
    ]);

    return new HealthStatusPayload(results);
  }
};
