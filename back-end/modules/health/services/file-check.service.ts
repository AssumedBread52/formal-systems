import { ComponentType } from '@/health/enums/component-type.enum';
import { HealthStatus } from '@/health/enums/health-status.enum';
import { ComponentStatusPayload } from '@/health/payloads/component-status.payload';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { access, constants } from 'fs/promises';

@Injectable()
export class FileCheckService {
  public constructor(private readonly configService: ConfigService) {
  }

  public async check(): Promise<ComponentStatusPayload> {
    try {
      await access(this.configService.getOrThrow('npm_package_json'), constants.R_OK);

      return new ComponentStatusPayload(ComponentType.file, HealthStatus.up);
    } catch {
      return new ComponentStatusPayload(ComponentType.file, HealthStatus.down);
    }
  }
};
