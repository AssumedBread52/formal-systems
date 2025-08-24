import { HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { DatabaseCheckService } from './database-check.service';
import { Injectable } from '@nestjs/common';

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
