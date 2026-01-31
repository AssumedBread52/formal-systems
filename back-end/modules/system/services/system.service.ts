import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { NotEmptyException } from '@/system/exceptions/not-empty.exception';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { UniqueTitleException } from '@/system/exceptions/unique-title.exception';
import { DefaultSearchPayload } from '@/system/payloads/default-search.payload';
import { EditSystemPayload } from '@/system/payloads/edit-system.payload';
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

  public async delete(sessionUserId: string, systemId: string): Promise<SystemEntity> {
    try {
      if (!isMongoId(sessionUserId)) {
        throw new Error('Invalid session user ID');
      }

      if (!isMongoId(systemId)) {
        throw new Error('Invalid system ID');
      }

      const system = await this.systemRepository.findOneBy({
        id: systemId
      });

      if (!system) {
        throw new SystemNotFoundException();
      }

      if (sessionUserId !== system.createdByUserId) {
        throw new OwnershipException();
      }

      if (0 < system.constantSymbolCount) {
        throw new NotEmptyException();
      }

      if (0 < system.variableSymbolCount) {
        throw new NotEmptyException();
      }

      if (0 < system.axiomCount) {
        throw new NotEmptyException();
      }

      if (0 < system.theoremCount) {
        throw new NotEmptyException();
      }

      if (0 < system.deductionCount) {
        throw new NotEmptyException();
      }

      if (0 < system.proofCount) {
        throw new NotEmptyException();
      }

      const deletedSystem = await this.systemRepository.remove(system);

      this.eventEmitter2.emit('system.delete.completed', deletedSystem);

      return deletedSystem;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Deleting system failed');
    }
  }

  public async selectById(systemId: string): Promise<SystemEntity> {
    try {
      if (!isMongoId(systemId)) {
        throw new Error('Invalid system ID');
      }

      const system = await this.systemRepository.findOneBy({
        id: systemId
      });

      if (!system) {
        throw new SystemNotFoundException();
      }

      return system;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading system failed');
    }
  }

  async readSystems(payload: any): Promise<PaginatedResultsPayload<SystemEntity>> {
    const searchPayload = validatePayload(payload, DefaultSearchPayload);

    const [systems, total] = await this.systemRepository.findAndCount({
      skip: (searchPayload.page - 1) * searchPayload.pageSize,
      take: searchPayload.pageSize,
      keywords: searchPayload.keywords,
      userIds: searchPayload.userIds
    });

    return new PaginatedResultsPayload(systems, total);
  }

  public async update(sessionUserId: string, systemId: string, editSystemPayload: EditSystemPayload): Promise<SystemEntity> {
    try {
      if (!isMongoId(sessionUserId)) {
        throw new Error('Invalid session user ID');
      }

      if (!isMongoId(systemId)) {
        throw new Error('Invalid system ID');
      }

      const system = await this.systemRepository.findOneBy({
        id: systemId
      });

      if (!system) {
        throw new SystemNotFoundException();
      }

      if (sessionUserId !== system.createdByUserId) {
        throw new OwnershipException();
      }

      const validatedEditSystemPayload = validatePayload(editSystemPayload, EditSystemPayload);

      if (validatedEditSystemPayload.newTitle !== system.title) {
        const conflict = await this.systemRepository.findOneBy({
          title: validatedEditSystemPayload.newTitle,
          createdByUserId: sessionUserId
        });

        if (conflict) {
          throw new UniqueTitleException();
        }
      }

      system.title = validatedEditSystemPayload.newTitle;
      system.description = validatedEditSystemPayload.newDescription;

      return this.systemRepository.save(system);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating system failed');
    }
  }
};
