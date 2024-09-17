import { Injectable } from "@nestjs/common";
import { HealthIndicatorResult, TypeOrmHealthIndicator } from "@nestjs/terminus";

@Injectable()
export class HealthService {
  constructor(private typeOrmHealthIndicator: TypeOrmHealthIndicator) {
  }

  checkDatabase(): Promise<HealthIndicatorResult> {
    return this.typeOrmHealthIndicator.pingCheck('database');
  }
};
