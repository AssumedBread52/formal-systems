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
    return this.createDomainEntityFromDatabaseEntity(await this.repository.remove(this.createDatabaseEntityFromDomainEntity(symbol)));
  }

  public async save(symbol: SymbolEntity): Promise<SymbolEntity> {
    return this.createDomainEntityFromDatabaseEntity(await this.repository.save(this.createDatabaseEntityFromDomainEntity(symbol)));
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
