import { validatePayload } from '@/common/helpers/validate-payload';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { EditSystemPayload } from '@/system/payloads/edit-system.payload';
import { FindPayload } from '@/system/payloads/find.payload';
import { MongoConflictPayload } from '@/system/payloads/mongo-conflict.payload';
import { MongoSearchPayload } from '@/system/payloads/mongo-search.payload';
import { MongoSystemIdPayload } from '@/system/payloads/mongo-system-id.payload';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';

@Injectable()
export class SystemRepository {
  public constructor(private readonly eventEmitter2: EventEmitter2, @InjectRepository(MongoSystemEntity) private readonly repository: MongoRepository<MongoSystemEntity>) {
  }

  public async findOneBy(findPayload: FindPayload) {
    try {
      const validatedFindPayload = validatePayload(findPayload, FindPayload);

      const filters = {} as Partial<MongoSystemEntity>;
      if (validatedFindPayload.id) {
        filters._id = new ObjectId(validatedFindPayload.id);
      }
      if (validatedFindPayload.title) {
        filters.title = validatedFindPayload.title;
      }
      if (validatedFindPayload.createdByUserId) {
        filters.createdByUserId = new ObjectId(validatedFindPayload.createdByUserId);
      }

      const mongoSystem = await this.repository.findOneBy(filters);

      if (!mongoSystem) {
        return null;
      }

      const system = this.createDomainEntityFromDatabaseEntity(mongoSystem);

      return validatePayload(system, SystemEntity);
    } catch {
      throw new Error('Finding system failed');
    }
  }

  public async readById(systemIdPayload: any): Promise<SystemEntity | null> {
    const { systemId } = validatePayload(systemIdPayload, MongoSystemIdPayload);

    const system = await this.repository.findOneBy({
      _id: new ObjectId(systemId)
    });

    if (!system) {
      return null;
    }

    return this.createDomainEntityFromDatabaseEntity(system);
  }

  public readConflictExists(conflictPayload: any): Promise<boolean> {
    const { title, createdByUserId } = validatePayload(conflictPayload, MongoConflictPayload);

    return this.repository.existsBy({
      title,
      createdByUserId: new ObjectId(createdByUserId)
    });
  }

  public async readSystems(searchPayload: any): Promise<[SystemEntity[], number]> {
    const { skip, take, keywords, userIds } = validatePayload(searchPayload, MongoSearchPayload);
    const where = {} as RootFilterOperators<MongoSystemEntity>;


    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }
    if (0 !== userIds.length) {
      where['createdByUserId'] = {
        $in: userIds.map((userId: string): ObjectId => {
          return new ObjectId(userId);
        })
      };
    }

    const [list, count] = await this.repository.findAndCount({
      skip,
      take,
      where
    });

    return [list.map(this.createDomainEntityFromDatabaseEntity), count];
  }

  public async remove(system: SystemEntity): Promise<SystemEntity> {
    try {
      const validatedSystem = validatePayload(system, SystemEntity);

      const mongoSystem = this.createDatabaseEntityFromDomainEntity(validatedSystem);

      const systemId = mongoSystem._id;

      const deletedSystem = await this.repository.remove(mongoSystem);

      deletedSystem._id = systemId;

      return this.createDomainEntityFromDatabaseEntity(deletedSystem);
    } catch {
      throw new Error('Removing system from database failed');
    }
  }

  public async save(system: SystemEntity): Promise<SystemEntity> {
    try {
      if (!system.id) {
        system.id = (new ObjectId()).toString();
      }

      const validatedSystem = validatePayload(system, SystemEntity);

      const mongoSystem = this.createDatabaseEntityFromDomainEntity(validatedSystem);

      const savedMongoSystem = await this.repository.save(mongoSystem);

      const savedSystem = this.createDomainEntityFromDatabaseEntity(savedMongoSystem);

      return validatePayload(savedSystem, SystemEntity);
    } catch {
      throw new Error('Saving system to database failed');
    }
  }

  public async update(system: any, editSystemPayload: any): Promise<SystemEntity> {
    const systemEntity = validatePayload(system, SystemEntity);
    const { newTitle, newDescription } = validatePayload(editSystemPayload, EditSystemPayload);

    const originalSystem = this.createDatabaseEntityFromDomainEntity(systemEntity);

    originalSystem.title = newTitle;
    originalSystem.description = newDescription;

    const updatedSystem = await this.repository.save(originalSystem);

    return this.createDomainEntityFromDatabaseEntity(updatedSystem);
  }

  public async delete(system: any): Promise<SystemEntity> {
    const systemEntity = validatePayload(system, SystemEntity);

    const originalSystem = this.createDatabaseEntityFromDomainEntity(systemEntity);

    const { _id } = originalSystem;

    const deletedSystem = await this.repository.remove(originalSystem);

    deletedSystem._id = _id;

    const domainEntity = this.createDomainEntityFromDatabaseEntity(deletedSystem);

    this.eventEmitter2.emit('system.delete.completed', deletedSystem);

    return domainEntity;
  }

  private createDatabaseEntityFromDomainEntity(system: SystemEntity): MongoSystemEntity {
    const mongoSystem = new MongoSystemEntity();

    mongoSystem._id = new ObjectId(system.id);
    mongoSystem.title = system.title;
    mongoSystem.description = system.description;
    mongoSystem.constantSymbolCount = system.constantSymbolCount;
    mongoSystem.variableSymbolCount = system.variableSymbolCount;
    mongoSystem.axiomCount = system.axiomCount;
    mongoSystem.theoremCount = system.theoremCount;
    mongoSystem.deductionCount = system.deductionCount;
    mongoSystem.proofCount = system.proofCount;
    mongoSystem.createdByUserId = new ObjectId(system.createdByUserId);

    return mongoSystem;
  }

  private createDomainEntityFromDatabaseEntity(mongoSystem: MongoSystemEntity): SystemEntity {
    const system = new SystemEntity();

    system.id = mongoSystem._id.toString();
    system.title = mongoSystem.title;
    system.description = mongoSystem.description;
    system.constantSymbolCount = mongoSystem.constantSymbolCount;
    system.variableSymbolCount = mongoSystem.variableSymbolCount;
    system.axiomCount = mongoSystem.axiomCount;
    system.theoremCount = mongoSystem.theoremCount;
    system.deductionCount = mongoSystem.deductionCount;
    system.proofCount = mongoSystem.proofCount;
    system.createdByUserId = mongoSystem.createdByUserId.toString();

    return system;
  }
};
