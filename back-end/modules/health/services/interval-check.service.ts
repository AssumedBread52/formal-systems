import { Injectable } from '@nestjs/common';
import { HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { DatabaseCheckService } from './database-check.service';

@Injectable()
export class IntervalCheckService {
  public constructor(private readonly databaseCheckService: DatabaseCheckService, private readonly healthCheckService: HealthCheckService) {
  }

  public runCheck(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      this.databaseCheckService.check.bind(this.databaseCheckService)
    ]);
  }
};
