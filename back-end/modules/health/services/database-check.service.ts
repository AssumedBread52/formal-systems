import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Injectable()
export class DatabaseCheckService {
  private static readonly key = 'database';

  public constructor(private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator) {
  }

  public check(): Promise<HealthIndicatorResult<'database'>> {
    return this.typeOrmHealthIndicator.pingCheck(DatabaseCheckService.key);
  }
};
