import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Injectable()
export class DatabaseCheckService {
  public constructor(private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator) {
  }

  public check(): Promise<HealthIndicatorResult<'database'>> {
    return this.typeOrmHealthIndicator.pingCheck('database');
  }
};
