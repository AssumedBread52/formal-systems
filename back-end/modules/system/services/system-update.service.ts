import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { EditTitlePayload } from '@/common/payloads/edit-title.payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { UniqueTitleException } from '@/system/exceptions/unique-title.exception';
import { CompositeAdapterRepository } from '@/system/repositories/composite-adapter.repository';
import { Injectable } from '@nestjs/common';
import { SystemReadService } from './system-read.service';

@Injectable()
export class SystemUpdateService {
  constructor(private systemReadService: SystemReadService, private compositeAdapterRepository: CompositeAdapterRepository) {
  }

  async update(sessionUserId: string, systemId: string, editSystemPayload: any): Promise<SystemEntity> {
    const { newTitle } = validatePayload(editSystemPayload, EditTitlePayload);
    const system = await this.systemReadService.readById(systemId);

    const { title, createdByUserId } = system;

    if (createdByUserId !== sessionUserId) {
      throw new OwnershipException();
    }

    if (title !== newTitle) {
      const conflictExists = await this.compositeAdapterRepository.readConflictExists({
        title: newTitle,
        createdByUserId
      });

      if (conflictExists) {
        throw new UniqueTitleException();
      }
    }

    return this.compositeAdapterRepository.update(system, editSystemPayload);
  }
};
