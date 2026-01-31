import { ComponentType } from '@/health/enums/component-type.enum';
import { HealthStatus } from '@/health/enums/health-status.enum';
import { ComponentStatusPayload } from '@/health/payloads/component-status.payload';
import { Injectable } from '@nestjs/common';
import { access, constants } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';

@Injectable()
export class FileCheckService {
  private static readonly FILE_NAME = 'package-lock.json';

  public async check(): Promise<ComponentStatusPayload> {
    try {
      const filePath = join(cwd(), FileCheckService.FILE_NAME);

      await access(filePath, constants.R_OK);

      return new ComponentStatusPayload(ComponentType.file, HealthStatus.up);
    } catch {
      return new ComponentStatusPayload(ComponentType.file, HealthStatus.down);
    }
  }
};
