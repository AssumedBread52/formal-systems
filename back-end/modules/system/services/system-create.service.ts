import { validatePayload } from '@/common/helpers/validate-payload';
import { TitlePayload } from '@/common/payloads/title.payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { UniqueTitleException } from '@/system/exceptions/unique-title.exception';
import { Injectable } from '@nestjs/common';
import { SystemPort } from './port/system.port';

@Injectable()
export class SystemCreateService {
  constructor(private systemPort: SystemPort) {
  }

  async create(sessionUserId: string, newSystemPayload: any): Promise<SystemEntity> {
    const { title } = validatePayload(newSystemPayload, TitlePayload);

    const conflictExists = await this.systemPort.readConflictExists({
      title,
      createdByUserId: sessionUserId
    });

    if (conflictExists) {
      throw new UniqueTitleException();
    }

    return this.systemPort.create({
      ...newSystemPayload,
      createdByUserId: sessionUserId
    });
  }
};
