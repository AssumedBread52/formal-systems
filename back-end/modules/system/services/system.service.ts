import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { EditTitlePayload } from '@/common/payloads/edit-title.payload';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { TitlePayload } from '@/common/payloads/title.payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { NotEmptyException } from '@/system/exceptions/not-empty.exception';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { UniqueTitleException } from '@/system/exceptions/unique-title.exception';
import { DefaultSearchPayload } from '@/system/payloads/default-search.payload';
import { SystemRepository } from '@/system/repositories/system.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemService {
  public constructor(private readonly systemRepository: SystemRepository) {
  }

  async create(sessionUserId: string, newSystemPayload: any): Promise<SystemEntity> {
    const { title } = validatePayload(newSystemPayload, TitlePayload);

    const conflictExists = await this.systemRepository.readConflictExists({
      title,
      createdByUserId: sessionUserId
    });

    if (conflictExists) {
      throw new UniqueTitleException();
    }

    return this.systemRepository.create({
      ...newSystemPayload,
      createdByUserId: sessionUserId
    });
  }

  async delete(sessionUserId: string, systemId: string): Promise<SystemEntity> {
    const system = await this.readById(systemId);

    const { constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, proofCount, createdByUserId } = system;

    if (createdByUserId !== sessionUserId) {
      throw new OwnershipException();
    }

    if (0 < constantSymbolCount || 0 < variableSymbolCount || 0 < axiomCount || 0 < theoremCount || 0 < deductionCount || 0 < proofCount) {
      throw new NotEmptyException();
    }

    return this.systemRepository.delete(system);
  }

  async readById(systemId: string): Promise<SystemEntity> {
    const system = await this.systemRepository.readById({
      systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    return system;
  }

  async readSystems(payload: any): Promise<PaginatedResultsPayload<SystemEntity>> {
    const searchPayload = validatePayload(payload, DefaultSearchPayload);

    const [systems, total] = await this.systemRepository.readSystems(searchPayload);

    return new PaginatedResultsPayload(systems, total);
  }

  async update(sessionUserId: string, systemId: string, editSystemPayload: any): Promise<SystemEntity> {
    const { newTitle } = validatePayload(editSystemPayload, EditTitlePayload);
    const system = await this.readById(systemId);

    const { title, createdByUserId } = system;

    if (createdByUserId !== sessionUserId) {
      throw new OwnershipException();
    }

    if (title !== newTitle) {
      const conflictExists = await this.systemRepository.readConflictExists({
        title: newTitle,
        createdByUserId
      });

      if (conflictExists) {
        throw new UniqueTitleException();
      }
    }

    return this.systemRepository.update(system, editSystemPayload);
  }
};
