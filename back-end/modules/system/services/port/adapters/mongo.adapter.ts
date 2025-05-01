import { validatePayload } from '@/common/helpers/validate-payload';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { AdapterType } from '@/system/enums/adapter-type.enum';
import { MongoSearchPayload } from '@/system/payloads/mongo-search.payload';
import { MongoSystemIdPayload } from '@/system/payloads/mongo-system-id.payload';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { SystemAdapter } from './system.adapter';

@Injectable()
export class MongoAdapter extends SystemAdapter {
  constructor(@InjectRepository(MongoSystemEntity) private mongoRepository: MongoRepository<MongoSystemEntity>) {
    super();
  }

  override async readById(systemIdPayload: any): Promise<SystemEntity | null> {
    const { systemId } = validatePayload(systemIdPayload, MongoSystemIdPayload);

    const system = await this.mongoRepository.findOneBy({
      _id: new ObjectId(systemId)
    });

    if (!system) {
      return system;
    }

    return this.convertToDomainEntity(system);
  }

  override async readSystems(searchPayload: any): Promise<[SystemEntity[], number]> {
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

  override async delete(system: any): Promise<SystemEntity> {
    const systemEntity = validatePayload(system, SystemEntity);

    const originalSystem = this.convertFromDomainEntity(systemEntity);

    await this.mongoRepository.remove(originalSystem);

    return systemEntity;
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
