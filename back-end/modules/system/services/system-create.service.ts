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

    const conflict = await this.systemPort.readConflict(sessionUserId, title);

    if (conflict) {
      throw new UniqueTitleException();
    }

    return this.systemPort.create(sessionUserId, newSystemPayload);
  }
};
