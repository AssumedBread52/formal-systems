import { IdPayload } from '@/auth/data-transfer-objects/id.payload';
import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { EditSystemPayload } from './data-transfer-objects/edit-system.payload';
import { NewSystemPayload } from './data-transfer-objects/new-system.payload';
import { PaginatedResultsPayload } from './data-transfer-objects/paginated-results.payload';
import { SystemEntity } from './system.entity';

@Injectable()
export class SystemService {
  constructor(@InjectRepository(SystemEntity) private systemRepository: MongoRepository<SystemEntity>) {
  }

  async checkForConflict(title: string, userId: ObjectId): Promise<void> {
    const collision = await this.systemRepository.findOneBy({
      title,
      createdByUserId: userId
    });

    if (collision) {
      throw new ConflictException('Systems must have a unique URL path.');
    }
  }

  async create(system: NewSystemPayload, sessionUserId: ObjectId): Promise<SystemEntity> {
    const { title, description } = system;

    await this.checkForConflict(title, sessionUserId);

    const { identifiers } = await this.systemRepository.insert({
      title,
      description,
      createdByUserId: sessionUserId
    });

    const { _id } = identifiers[0];

    return {
      _id,
      title,
      description,
      createdByUserId: sessionUserId
    };
  }

  async readById(id: string, extended?: boolean): Promise<SystemEntity | null> {
    if (!extended) {
      return this.systemRepository.findOneBy({
        _id: new ObjectId(id)
      });
    }

    const entities = await this.systemRepository.aggregateEntity([
      {
        $match: {
          id: new ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'user',
          localField: 'createdByUserId',
          foreignField: '_id',
          as: 'createdByUser'
        }
      },
      {
        $set: {
          createdByUser: {
            $arrayElemAt: [
              "$createdByUser", 0
            ]
          }
        }
      }
    ]).toArray();

    if (0 === entities.length) {
      return null;
    } else {
      return entities[0];
    }
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

    const total = await this.systemRepository.countBy(where);
    const results = await this.systemRepository.aggregateEntity([
      {
        $match: where,
      },
      {
        $lookup: {
          from: 'user',
          localField: 'createdByUserId',
          foreignField: '_id',
          as: 'createdByUser'
        }
      },
      {
        $set: {
          createdByUser: {
            $arrayElemAt: [
              "$createdByUser", 0
            ]
          }
        }
      }
    ]).skip(skip).limit(take).toArray();

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

    const result = await this.systemRepository.update(_id, system);

    const { affected } = result;

    if (1 !== affected) {
      throw new InternalServerErrorException(`Updating by ID affected ${affected} instead of 1.`);
    }

    return {
      id: _id.toString()
    };
  }

  async delete(id: string): Promise<IdPayload> {
    const result = await this.systemRepository.delete(id);

    const { affected } = result;

    if (1 !== affected) {
      throw new InternalServerErrorException(`Deleting by ID affected ${affected} instead of 1.`);
    }

    return {
      id
    };
  }
};
