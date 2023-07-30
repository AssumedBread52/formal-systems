import { IdPayload } from '@/common/payloads/id.payload';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { EditSystemPayload } from './payloads/edit-system.payload';
import { NewSystemPayload } from './payloads/new-system.payload';
import { PaginatedResultsPayload } from './payloads/paginated-results.payload';
import { SystemEntity } from './system.entity';

@Injectable()
export class SystemService {
  constructor(@InjectRepository(SystemEntity) private systemRepository: MongoRepository<SystemEntity>) {
  }

  async checkForConflict(title: string, createdByUserId: ObjectId): Promise<void> {
    const collision = await this.systemRepository.findOneBy({
      title,
      createdByUserId
    });

    if (collision) {
      throw new ConflictException('Systems created by the same user must have a unique title.');
    }
  }

  async create(newSystemPayload: NewSystemPayload, sessionUserId: ObjectId): Promise<SystemEntity> {
    const { title, description } = newSystemPayload;

    await this.checkForConflict(title, sessionUserId);

    const system = new SystemEntity();

    system.title = title;
    system.description = description;
    system.createdByUserId = sessionUserId;

    return this.systemRepository.save(system);
  }

  readById(id: string): Promise<SystemEntity | null> {
    return this.systemRepository.findOneBy({
      _id: new ObjectId(id)
    });
  }

  async readSystems(page: number, take: number, keywords?: string | string[]): Promise<PaginatedResultsPayload> {
    const skip = (page - 1) * take;
    const where = {} as RootFilterOperators<SystemEntity>;

    if (keywords && 0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: Array.isArray(keywords) ? keywords.join(',') : keywords
      };
    }

    const [results, total] = await this.systemRepository.findAndCount({
      where,
      skip,
      take
    });

    return new PaginatedResultsPayload(total, results);
  }

  async update(system: SystemEntity, editSystemPayload: EditSystemPayload): Promise<IdPayload> {
    const { _id, title, createdByUserId } = system;
    const { newTitle, newDescription } = editSystemPayload;

    if (title !== newTitle) {
      await this.checkForConflict(newTitle, createdByUserId);
    }

    system.title = newTitle;
    system.description = newDescription;

    await this.systemRepository.save(system);

    return new IdPayload(_id);
  }

  async delete(system: SystemEntity): Promise<IdPayload> {
    const { _id } = system;

    await this.systemRepository.remove(system);

    return new IdPayload(_id);
  }
};
