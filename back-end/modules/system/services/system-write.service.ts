import { validatePayload } from '@/common/helpers/validate-payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { UniqueNameException } from '@/system/exceptions/unique-name.exception';
import { EditSystemPayload } from '@/system/payloads/edit-system.payload';
import { NewSystemPayload } from '@/system/payloads/new-system.payload';
import { UserReadService } from '@/user/services/user-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemReadService } from './system-read.service';

@Injectable()
export class SystemWriteService {
  public constructor(private readonly systemReadService: SystemReadService, private readonly userReadService: UserReadService, @InjectRepository(SystemEntity) private readonly repository: Repository<SystemEntity>) {
  }

  public async create(userId: string, newSystemPayload: NewSystemPayload): Promise<SystemEntity> {
    try {
      const validatedNewSystemPayload = validatePayload(newSystemPayload, NewSystemPayload);

      const user = await this.userReadService.selectById(userId);

      const nameConflict = await this.repository.existsBy({
        name: validatedNewSystemPayload.name,
        ownerUserId: user.id
      });

      if (nameConflict) {
        throw new UniqueNameException();
      }

      const system = new SystemEntity();

      system.ownerUserId = user.id;
      system.name = validatedNewSystemPayload.name;
      system.description = validatedNewSystemPayload.description;

      return await this.repository.save(system);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Creating system failed');
    }
  }

  public async delete(userId: string, systemId: string): Promise<SystemEntity> {
    try {
      const system = await this.repository.findOneBy({
        id: systemId
      });

      if (!system) {
        throw new SystemNotFoundException();
      }

      await this.systemReadService.verifyOwnership(userId, systemId);

      await this.systemReadService.verifySystemNotInUse(systemId);

      const removedSystem = await this.repository.remove(system);

      removedSystem.id = systemId;

      return removedSystem;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Deleting system failed');
    }
  }

  public async update(userId: string, systemId: string, editSystemPayload: EditSystemPayload): Promise<SystemEntity> {
    try {
      const validatedEditSystemPayload = validatePayload(editSystemPayload, EditSystemPayload);

      const system = await this.repository.findOneBy({
        id: systemId
      });

      if (!system) {
        throw new SystemNotFoundException();
      }

      await this.systemReadService.verifyOwnership(userId, systemId);

      if (validatedEditSystemPayload.name !== undefined && validatedEditSystemPayload.name !== system.name) {
        await this.systemReadService.verifyUniqueName(userId, validatedEditSystemPayload.name);

        system.name = validatedEditSystemPayload.name;
      }

      if (validatedEditSystemPayload.description !== undefined && validatedEditSystemPayload.description !== system.description) {
        system.description = validatedEditSystemPayload.description;
      }

      return await this.repository.save(system);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating system failed');
    }
  }
};
