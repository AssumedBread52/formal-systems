import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { EditSystemPayload } from './payloads/edit-system.payload';
import { NewSystemPayload } from './payloads/new-system.payload';
import { SystemEntity } from './system.entity';

@Injectable()
export class SystemService {
  constructor(@InjectRepository(SystemEntity) private systemRepository: MongoRepository<SystemEntity>) {
  }

  async create(newSystemPayload: NewSystemPayload, sessionUserId: ObjectId): Promise<SystemEntity> {
    const { title, description } = newSystemPayload;

    await this.conflictCheck(title, sessionUserId);

    const system = new SystemEntity();

    system.title = title;
    system.description = description;
    system.createdByUserId = sessionUserId;

    return this.systemRepository.save(system);
  }

  readById(systemId: ObjectId): Promise<SystemEntity | null> {
    return this.systemRepository.findOneBy({
      _id: systemId
    });
  }

  readSystems(page: number, count: number, keywords: string[], userIds: ObjectId[]): Promise<[SystemEntity[], number]> {
    const where = {} as RootFilterOperators<SystemEntity>;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    if (0 !== userIds.length) {
      where.createdByUserId = {
        $in: userIds
      };
    }

    return this.systemRepository.findAndCount({
      skip: (page - 1) * count,
      take: count,
      where
    });
  }

  async update(system: SystemEntity, editSystemPayload: EditSystemPayload): Promise<SystemEntity> {
    const { title, createdByUserId } = system;
    const { newTitle, newDescription } = editSystemPayload;

    if (title !== newTitle) {
      await this.conflictCheck(newTitle, createdByUserId);
    }

    system.title = newTitle;
    system.description = newDescription;

    return this.systemRepository.save(system);
  }

  delete(system: SystemEntity): Promise<SystemEntity> {
    return this.systemRepository.remove(system);
  }

  private async conflictCheck(title: string, createdByUserId: ObjectId): Promise<void> {
    const collision = await this.systemRepository.findOneBy({
      title,
      createdByUserId
    });

    if (collision) {
      throw new ConflictException('Systems created by the same user must have a unique title.');
    }
  }
};
