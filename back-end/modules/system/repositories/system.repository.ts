import { validatePayload } from '@/common/helpers/validate-payload';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { FindOneByPayload } from '@/system/payloads/find-one-by.payload';
import { MongoSearchPayload } from '@/system/payloads/mongo-search.payload';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Filter, MongoRepository, RootFilterOperators } from 'typeorm';

@Injectable()
export class SystemRepository {
  public constructor(@InjectRepository(MongoSystemEntity) private readonly repository: MongoRepository<MongoSystemEntity>) {
  }

  public async findOneBy(findOneByPayload: FindOneByPayload) {
    try {
      const validatedFindOneByPayload = validatePayload(findOneByPayload, FindOneByPayload);

      const filters = {} as Filter<MongoSystemEntity>;
      if (validatedFindOneByPayload.id) {
        filters._id = new ObjectId(validatedFindOneByPayload.id);
      }
      if (validatedFindOneByPayload.title) {
        filters.title = validatedFindOneByPayload.title;
      }
      if (validatedFindOneByPayload.createdByUserId) {
        filters.createdByUserId = new ObjectId(validatedFindOneByPayload.createdByUserId);
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
