import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { EditTitlePayload } from '@/common/payloads/edit-title.payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { UniqueTitleException } from '@/system/exceptions/unique-title.exception';
import { Injectable } from '@nestjs/common';
import { SystemPort } from './port/system.port';
import { SystemReadService } from './system-read.service';

@Injectable()
export class SystemUpdateService {
  constructor(private systemPort: SystemPort, private systemReadService: SystemReadService) {
  }

  async update(sessionUserId: string, systemId: string, editSystemPayload: any): Promise<SystemEntity> {
    const { newTitle } = validatePayload(editSystemPayload, EditTitlePayload);
    const system = await this.systemReadService.readById(systemId);

    const { title, createdByUserId } = system;

    if (createdByUserId !== sessionUserId) {
      throw new OwnershipException();
    }

    if (title !== newTitle) {
      const conflict = await this.systemPort.readConflict(createdByUserId, newTitle);

      if (conflict) {
        throw new UniqueTitleException();
      }
    }

    return this.systemPort.update(system, editSystemPayload);
  }
};
