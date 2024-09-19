import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Injectable()
export class DatabaseCheckService {
  constructor(private typeOrmHealthIndicator: TypeOrmHealthIndicator) {
  }

  check(): Promise<HealthIndicatorResult> {
    return this.typeOrmHealthIndicator.pingCheck('database');
  }
};
