import { validatePayload } from '@/common/helpers/validate-payload';
import { TitlePayload } from '@/common/payloads/title.payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { UniqueTitleException } from '@/system/exceptions/unique-title.exception';
import { CompositeAdapterRepository } from '@/system/repositories/composite-adapter.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemCreateService {
  constructor(private compositeAdapterRepository: CompositeAdapterRepository) {
  }

  async create(sessionUserId: string, newSystemPayload: any): Promise<SystemEntity> {
    const { title } = validatePayload(newSystemPayload, TitlePayload);

    const conflictExists = await this.compositeAdapterRepository.readConflictExists({
      title,
      createdByUserId: sessionUserId
    });

    if (conflictExists) {
      throw new UniqueTitleException();
    }

    return this.compositeAdapterRepository.create({
      ...newSystemPayload,
      createdByUserId: sessionUserId
    });
  }
};
