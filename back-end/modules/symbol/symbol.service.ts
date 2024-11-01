import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { SymbolType } from './enums/symbol-type.enum';
import { InUseException } from './exceptions/in-use.exception';
import { SymbolEntity } from './symbol.entity';

@Injectable()
export class SymbolService {
  constructor(@InjectRepository(SymbolEntity) private symbolRepository: MongoRepository<SymbolEntity>) {
  }

  readById(systemId: ObjectId, symbolId: ObjectId): Promise<SymbolEntity | null> {
    return this.symbolRepository.findOneBy({
      _id: symbolId,
      systemId
    });
  }

  readByIds(systemId: ObjectId, symbolIds: ObjectId[]): Promise<SymbolEntity[]> {
    return this.symbolRepository.find({
      _id: {
        $in: symbolIds
      },
      systemId
    });
  }

  readByType(systemId: ObjectId, type: SymbolType): Promise<SymbolEntity[]> {
    return this.symbolRepository.find({
      type,
      systemId
    });
  }

  readSymbols(page: number, count: number, keywords: string[], types: SymbolType[], systemId: ObjectId): Promise<[SymbolEntity[], number]> {
    const where = {
      systemId
    } as RootFilterOperators<SymbolEntity>;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    if (0 !== types.length) {
      where.type = {
        $in: types
      };
    }

    return this.symbolRepository.findAndCount({
      skip: (page - 1) * count,
      take: count,
      where
    });
  }

  delete(symbol: SymbolEntity): Promise<SymbolEntity> {
    const { axiomAppearances, theoremAppearances, deductionAppearances } = symbol;

    if (axiomAppearances > 0 || theoremAppearances > 0 || deductionAppearances > 0) {
      throw new InUseException();
    }

    return this.symbolRepository.remove(symbol);
  }
};
