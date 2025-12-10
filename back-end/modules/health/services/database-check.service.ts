import { ComponentType } from '@/health/enums/component-type.enum';
import { HealthStatus } from '@/health/enums/health-status.enum';
import { ComponentStatusPayload } from '@/health/payloads/component-status.payload';
import { Injectable } from '@nestjs/common';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';

@Injectable()
export class DatabaseCheckService {
  private static readonly KEY = 'database';

  public constructor(private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator) {
  }

  public async check(): Promise<ComponentStatusPayload> {
    try {
      const { database } = await this.typeOrmHealthIndicator.pingCheck(DatabaseCheckService.KEY);

      const { status } = database;

      switch (status) {
        case 'up':
          return new ComponentStatusPayload(ComponentType.database, HealthStatus.up);
        case 'down':
          return new ComponentStatusPayload(ComponentType.database, HealthStatus.down);
      }
    } catch {
      return new ComponentStatusPayload(ComponentType.database, HealthStatus.down);
    }
  }
};
