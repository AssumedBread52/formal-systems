import { OwnershipException } from '@/auth/exceptions/ownership.exception';
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

@Injectable()
export class SystemWriteService {
  public constructor(private readonly userReadService: UserReadService, @InjectRepository(SystemEntity) private readonly repository: Repository<SystemEntity>) {
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

      const user = await this.userReadService.selectById(userId);

      if (user.id !== system.ownerUserId) {
        throw new OwnershipException();
      }

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

      const user = await this.userReadService.selectById(userId);

      if (user.id !== system.ownerUserId) {
        throw new OwnershipException();
      }

      if (validatedEditSystemPayload.newName !== system.name) {
        const nameConflict = await this.repository.existsBy({
          ownerUserId: user.id,
          name: validatedEditSystemPayload.newName
        });

        if (nameConflict) {
          throw new UniqueNameException();
        }
      }

      system.name = validatedEditSystemPayload.newName;
      system.description = validatedEditSystemPayload.newDescription;

      return await this.repository.save(system);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating system failed');
    }
  }
};
