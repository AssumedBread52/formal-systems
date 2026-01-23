import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { EditTitlePayload } from '@/common/payloads/edit-title.payload';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { NotEmptyException } from '@/system/exceptions/not-empty.exception';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { UniqueTitleException } from '@/system/exceptions/unique-title.exception';
import { DefaultSearchPayload } from '@/system/payloads/default-search.payload';
import { NewSystemPayload } from '@/system/payloads/new-system.payload';
import { SystemRepository } from '@/system/repositories/system.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { isMongoId } from 'class-validator';

@Injectable()
export class SystemService {
  public constructor(private readonly eventEmitter2: EventEmitter2, private readonly systemRepository: SystemRepository) {
  }

  public async create(sessionUserId: string, newSystemPayload: NewSystemPayload): Promise<SystemEntity> {
    try {
      if (!isMongoId(sessionUserId)) {
        throw new Error('Invalid session user ID');
      }

      const validatedNewSystemPayload = validatePayload(newSystemPayload, NewSystemPayload);

      const conflict = await this.systemRepository.findOneBy({
        title: validatedNewSystemPayload.title,
        createdByUserId: sessionUserId
      });

      if (conflict) {
        throw new UniqueTitleException();
      }

      const system = new SystemEntity();

      system.title = validatedNewSystemPayload.title;
      system.description = validatedNewSystemPayload.description;
      system.createdByUserId = sessionUserId;

      const savedSystem = this.systemRepository.save(system);

      this.eventEmitter2.emit('system.create.completed', system);

      return savedSystem;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Creating system failed');
    }
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
