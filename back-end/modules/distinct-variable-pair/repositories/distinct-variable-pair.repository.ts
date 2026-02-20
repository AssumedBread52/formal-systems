import { validatePayload } from '@/common/helpers/validate-payload';
import { DistinctVariablePairEntity } from '@/distinct-variable-pair/entities/distinct-variable-pair.entity';
import { MongoDistinctVariablePairEntity } from '@/distinct-variable-pair/entities/mongo-distinct-variable-pair.entity';
import { FindAndCountPayload } from '@/distinct-variable-pair/payloads/find-and-count.payload';
import { FindOneByPayload } from '@/distinct-variable-pair/payloads/find-one-by.payload';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { Filter, MongoRepository } from 'typeorm';

@Injectable()
export class DistinctVariablePairRepository {
  public constructor(@InjectRepository(MongoDistinctVariablePairEntity) private readonly repository: MongoRepository<MongoDistinctVariablePairEntity>) {
  }

  public async findAndCount(findAndCountPayload: FindAndCountPayload): Promise<[DistinctVariablePairEntity[], number]> {
    try {
      const validatedFindAndCountPayload = validatePayload(findAndCountPayload, FindAndCountPayload);

      const where = {
        systemId: new ObjectId(validatedFindAndCountPayload.systemId)
      } as Filter<MongoDistinctVariablePairEntity>;
      if (0 < validatedFindAndCountPayload.mustIncludeVariableSymbolIds.length) {
        where.variableSymbolIds = {
          $all: validatedFindAndCountPayload.mustIncludeVariableSymbolIds.map((variablSymbolId: string): ObjectId => {
            return new ObjectId(variablSymbolId);
          })
        };
      }
      if (0 < validatedFindAndCountPayload.mayIncludeVariableSymbolIds.length) {
        if (!where.variableSymbolIds) {
          where.variableSymbolIds = {
            $in: validatedFindAndCountPayload.mayIncludeVariableSymbolIds.map((variableSymbolId: string): ObjectId => {
              return new ObjectId(variableSymbolId);
            })
          };
        } else {
          where.variableSymbolIds = {
            ...where.variableSymbolIds,
            $in: validatedFindAndCountPayload.mayIncludeVariableSymbolIds.map((variableSymbolId: string): ObjectId => {
              return new ObjectId(variableSymbolId);
            })
          };
        }
      }

      const [mongoDistinctVariablePairs, total] = await this.repository.findAndCount({
        skip: validatedFindAndCountPayload.skip,
        take: validatedFindAndCountPayload.take,
        where
      });

      const distinctVariablePairs = mongoDistinctVariablePairs.map(this.createDomainEntityFromDatabaseEntity);

      return [
        distinctVariablePairs.map((distinctVariablePair: DistinctVariablePairEntity): DistinctVariablePairEntity => {
          return validatePayload(distinctVariablePair, DistinctVariablePairEntity);
        }),
        total
      ];
    } catch {
      throw new Error('Finding and counting distinct variable pairs failed');
    }
  }

  public async findOneBy(findOneByPayload: FindOneByPayload): Promise<DistinctVariablePairEntity | null> {
    try {
      const validatedFindOneByPayload = validatePayload(findOneByPayload, FindOneByPayload);

      const filters = {} as Filter<MongoDistinctVariablePairEntity>;
      if (validatedFindOneByPayload.id) {
        filters._id = new ObjectId(validatedFindOneByPayload.id);
      }
      if (validatedFindOneByPayload.variableSymbolIds) {
        filters.variableSymbolIds = [
          new ObjectId(validatedFindOneByPayload.variableSymbolIds[0]),
          new ObjectId(validatedFindOneByPayload.variableSymbolIds[1])
        ];
      }
      if (validatedFindOneByPayload.systemId) {
        filters.systemId = new ObjectId(validatedFindOneByPayload.systemId);
      }

      const mongoDistinctVariablePair = await this.repository.findOneBy(filters);

      if (!mongoDistinctVariablePair) {
        return null;
      }

      const distinctVariablePair = this.createDomainEntityFromDatabaseEntity(mongoDistinctVariablePair);

      return validatePayload(distinctVariablePair, DistinctVariablePairEntity);
    } catch {
      throw new Error('Finding distinct variable pair failed');
    }
  }

  public async remove(distinctVariablePair: DistinctVariablePairEntity): Promise<DistinctVariablePairEntity> {
    try {
      const validatedDistinctVariablePair = validatePayload(distinctVariablePair, DistinctVariablePairEntity);

      const mongoDistinctVariablePair = this.createDatabaseEntityFromDomainEntity(validatedDistinctVariablePair);

      const distinctVariablePairId = mongoDistinctVariablePair._id;

      const deletedMongoDistinctVariablePair = await this.repository.remove(mongoDistinctVariablePair);

      deletedMongoDistinctVariablePair._id = distinctVariablePairId;

      const deletedDistinctVariablePair = this.createDomainEntityFromDatabaseEntity(deletedMongoDistinctVariablePair);

      return validatePayload(deletedDistinctVariablePair, DistinctVariablePairEntity);
    } catch {
      throw new Error('Removing distinct variable pair from database failed');
    }
  }

  public async save(distinctVariablePair: DistinctVariablePairEntity): Promise<DistinctVariablePairEntity> {
    try {
      if (!distinctVariablePair.id) {
        distinctVariablePair.id = (new ObjectId()).toString();
      }

      const validatedDistinctVariablePair = validatePayload(distinctVariablePair, DistinctVariablePairEntity);

      const mongoDistinctVariablePair = this.createDatabaseEntityFromDomainEntity(validatedDistinctVariablePair);

      const savedMongoDistinctVariablePair = await this.repository.save(mongoDistinctVariablePair);

      const savedDistinctVariablePair = this.createDomainEntityFromDatabaseEntity(savedMongoDistinctVariablePair);

      return validatePayload(savedDistinctVariablePair, DistinctVariablePairEntity);
    } catch {
      throw new Error('Saving distinct variable pair to database failed');
    }
  }

  private createDatabaseEntityFromDomainEntity(distinctVariablePair: DistinctVariablePairEntity): MongoDistinctVariablePairEntity {
    const mongoDistinctVariablePair = new MongoDistinctVariablePairEntity();

    mongoDistinctVariablePair._id = new ObjectId(distinctVariablePair.id);
    mongoDistinctVariablePair.variableSymbolIds[0] = new ObjectId(distinctVariablePair.variableSymbolIds[0]);
    mongoDistinctVariablePair.variableSymbolIds[1] = new ObjectId(distinctVariablePair.variableSymbolIds[1]);
    mongoDistinctVariablePair.systemId = new ObjectId(distinctVariablePair.systemId);
    mongoDistinctVariablePair.createdByUserId = new ObjectId(distinctVariablePair.createdByUserId);

    return mongoDistinctVariablePair;
  }

  private createDomainEntityFromDatabaseEntity(mongoDistinctVariablePair: MongoDistinctVariablePairEntity): DistinctVariablePairEntity {
    const distinctVariablePair = new DistinctVariablePairEntity();

    distinctVariablePair.id = mongoDistinctVariablePair._id.toString();
    distinctVariablePair.variableSymbolIds[0] = mongoDistinctVariablePair.variableSymbolIds[0].toString();
    distinctVariablePair.variableSymbolIds[1] = mongoDistinctVariablePair.variableSymbolIds[1].toString();
    distinctVariablePair.systemId = mongoDistinctVariablePair.systemId.toString();
    distinctVariablePair.createdByUserId = mongoDistinctVariablePair.createdByUserId.toString();

    return distinctVariablePair;
  }
};
