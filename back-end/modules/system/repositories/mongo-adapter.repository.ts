import { validatePayload } from '@/common/helpers/validate-payload';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { AdapterType } from '@/system/enums/adapter-type.enum';
import { EditSystemPayload } from '@/system/payloads/edit-system.payload';
import { MongoConflictPayload } from '@/system/payloads/mongo-conflict.payload';
import { MongoNewSystemPayload } from '@/system/payloads/mongo-new-system.payload';
import { MongoSearchPayload } from '@/system/payloads/mongo-search.payload';
import { MongoSystemIdPayload } from '@/system/payloads/mongo-system-id.payload';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { SystemRepository } from './system.repository';

@Injectable()
export class MongoAdapterRepository implements SystemRepository {
  constructor(@InjectRepository(MongoSystemEntity) private mongoRepository: MongoRepository<MongoSystemEntity>) {
  }

  async create(newSystemPayload: any): Promise<SystemEntity> {
    const { title, description, createdByUserId } = validatePayload(newSystemPayload, MongoNewSystemPayload);

    const system = new MongoSystemEntity();

    system.title = title;
    system.description = description;
    system.createdByUserId = new ObjectId(createdByUserId);

    const newSystem = await this.mongoRepository.save(system);

    return this.convertToDomainEntity(newSystem);
  }

  async readById(systemIdPayload: any): Promise<SystemEntity | null> {
    const { systemId } = validatePayload(systemIdPayload, MongoSystemIdPayload);

    const system = await this.mongoRepository.findOneBy({
      _id: new ObjectId(systemId)
    });

    if (!system) {
      return null;
    }

    return this.convertToDomainEntity(system);
  }

  readConflictExists(conflictPayload: any): Promise<boolean> {
    const { title, createdByUserId } = validatePayload(conflictPayload, MongoConflictPayload);

    return this.mongoRepository.existsBy({
      title,
      createdByUserId: new ObjectId(createdByUserId)
    });
  }

  async readSystems(searchPayload: any): Promise<[SystemEntity[], number]> {
    const { skip, take, keywords, userIds } = validatePayload(searchPayload, MongoSearchPayload);
    const where = {} as RootFilterOperators<MongoSystemEntity>;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    if (0 !== userIds.length) {
      where.createdByUserId = {
        $in: userIds.map((userId: string): ObjectId => {
          return new ObjectId(userId);
        })
      };
    }

    const [list, count] = await this.mongoRepository.findAndCount({
      skip,
      take,
      where
    });

    return [list.map(this.convertToDomainEntity), count];
  }

  async update(system: any, editSystemPayload: any): Promise<SystemEntity> {
    const systemEntity = validatePayload(system, SystemEntity);
    const { newTitle, newDescription } = validatePayload(editSystemPayload, EditSystemPayload);

    const originalSystem = this.convertFromDomainEntity(systemEntity);

    originalSystem.title = newTitle;
    originalSystem.description = newDescription;

    const updatedSystem = await this.mongoRepository.save(originalSystem);

    return this.convertToDomainEntity(updatedSystem);
  }

  async delete(system: any): Promise<SystemEntity> {
    const systemEntity = validatePayload(system, SystemEntity);

    const originalSystem = this.convertFromDomainEntity(systemEntity);

    const { _id } = originalSystem;

    const deletedSystem = await this.mongoRepository.remove(originalSystem);

    deletedSystem._id = _id;

    return this.convertToDomainEntity(deletedSystem);
  }

  private convertFromDomainEntity(system: SystemEntity): MongoSystemEntity {
    const { id, title, description, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, proofCount, createdByUserId } = system;

    const mongoSystem = new MongoSystemEntity();

    mongoSystem._id = new ObjectId(id);
    mongoSystem.title = title;
    mongoSystem.description = description;
    mongoSystem.constantSymbolCount = constantSymbolCount;
    mongoSystem.variableSymbolCount = variableSymbolCount;
    mongoSystem.axiomCount = axiomCount;
    mongoSystem.theoremCount = theoremCount;
    mongoSystem.deductionCount = deductionCount;
    mongoSystem.proofCount = proofCount;
    mongoSystem.createdByUserId = new ObjectId(createdByUserId);

    return mongoSystem;
  }

  private convertToDomainEntity(mongoSystem: MongoSystemEntity): SystemEntity {
    const { _id, title, description, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, proofCount, createdByUserId } = mongoSystem;

    const system = new SystemEntity();

    system.type = AdapterType.Mongo;
    system.id = _id.toString();
    system.title = title;
    system.description = description;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.axiomCount = axiomCount;
    system.theoremCount = theoremCount;
    system.deductionCount = deductionCount;
    system.proofCount = proofCount;
    system.createdByUserId = createdByUserId.toString();

    return system;
  }
};
