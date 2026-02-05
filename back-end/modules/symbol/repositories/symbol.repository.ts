import { validatePayload } from '@/common/helpers/validate-payload';
import { MongoSymbolEntity } from '@/symbol/entities/mongo-symbol.entitiy';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { FilterOperators, FindManyOptions, MongoRepository } from 'typeorm';
import { MongoFindManyOptions } from 'typeorm/find-options/mongodb/MongoFindManyOptions';

@Injectable()
export class SymbolRepository {
  public constructor(@InjectRepository(MongoSymbolEntity) private readonly repository: MongoRepository<MongoSymbolEntity>) {
  }

  public async find(options?: FindManyOptions<MongoSymbolEntity> | Partial<MongoSymbolEntity> | FilterOperators<MongoSymbolEntity> | undefined): Promise<SymbolEntity[]> {
    return (await this.repository.find(options)).map(this.createDomainEntityFromDatabaseEntity);
  }

  public async findAndCount(options?: MongoFindManyOptions<MongoSymbolEntity> | undefined): Promise<[SymbolEntity[], number]> {
    const [symbols, total] = await this.repository.findAndCount(options);

    return [symbols.map(this.createDomainEntityFromDatabaseEntity), total];
  }

  public async findOneBy(where: any): Promise<SymbolEntity | null> {
    const found = await this.repository.findOneBy(where);

    if (!found) {
      return null;
    }

    return this.createDomainEntityFromDatabaseEntity(found);
  }

  public async remove(symbol: SymbolEntity): Promise<SymbolEntity> {
    try {
      const validatedSymbol = validatePayload(symbol, SymbolEntity);

      const mongoSymbol = this.createDatabaseEntityFromDomainEntity(validatedSymbol);

      const symbolId = mongoSymbol._id;

      const deletedMongoSymbol = await this.repository.remove(mongoSymbol);

      deletedMongoSymbol._id = symbolId;

      const deletedSymbol = this.createDomainEntityFromDatabaseEntity(deletedMongoSymbol);

      return validatePayload(deletedSymbol, SymbolEntity);
    } catch {
      throw new Error('Removing symbol from database failed');
    }
  }

  public async save(symbol: SymbolEntity): Promise<SymbolEntity> {
    try {
      if (!symbol.id) {
        symbol.id = (new ObjectId()).toString();
      }

      const validatedSymbol = validatePayload(symbol, SymbolEntity);

      const mongoSymbol = this.createDatabaseEntityFromDomainEntity(validatedSymbol);

      const savedMongoSymbol = await this.repository.save(mongoSymbol);

      const savedSymbol = this.createDomainEntityFromDatabaseEntity(savedMongoSymbol);

      return validatePayload(savedSymbol, SymbolEntity);
    } catch {
      throw new Error('Saving symbol to database failed');
    }
  }

  private createDatabaseEntityFromDomainEntity(symbol: SymbolEntity): MongoSymbolEntity {
    const mongoSymbol = new MongoSymbolEntity();

    mongoSymbol._id = new ObjectId(symbol.id);
    mongoSymbol.title = symbol.title;
    mongoSymbol.description = symbol.description;
    mongoSymbol.type = symbol.type;
    mongoSymbol.content = symbol.content;
    mongoSymbol.axiomAppearanceCount = symbol.axiomAppearanceCount;
    mongoSymbol.theoremAppearanceCount = symbol.theoremAppearanceCount;
    mongoSymbol.deductionAppearanceCount = symbol.deductionAppearanceCount;
    mongoSymbol.proofAppearanceCount = symbol.proofAppearanceCount;
    mongoSymbol.systemId = new ObjectId(symbol.systemId);
    mongoSymbol.createdByUserId = new ObjectId(symbol.createdByUserId);

    return mongoSymbol;
  }

  private createDomainEntityFromDatabaseEntity(mongoSymbol: MongoSymbolEntity): SymbolEntity {
    const symbol = new SymbolEntity();

    symbol.id = mongoSymbol._id.toString();
    symbol.title = mongoSymbol.title;
    symbol.description = mongoSymbol.description;
    symbol.type = mongoSymbol.type;
    symbol.content = mongoSymbol.content;
    symbol.axiomAppearanceCount = mongoSymbol.axiomAppearanceCount;
    symbol.theoremAppearanceCount = mongoSymbol.theoremAppearanceCount;
    symbol.deductionAppearanceCount = mongoSymbol.deductionAppearanceCount;
    symbol.proofAppearanceCount = mongoSymbol.proofAppearanceCount;
    symbol.systemId = mongoSymbol.systemId.toString();
    symbol.createdByUserId = mongoSymbol.createdByUserId.toString();

    return symbol;
  }
};
