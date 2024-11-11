import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { SearchPayload } from '@/symbol/payloads/search.payload';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class SymbolReadService {
  constructor(@InjectRepository(SymbolEntity) private symbolRepository: MongoRepository<SymbolEntity>, private validateService: ValidateService) {
  }

  async readById(systemId: any, symbolId: any): Promise<SymbolEntity> {
    const symbol = await this.symbolRepository.findOneBy({
      _id: this.validateService.idCheck(symbolId),
      systemId: this.validateService.idCheck(systemId)
    });

    if (!symbol) {
      throw new SymbolNotFoundException();
    }

    return symbol;
  }

  async readSymbolDictionary(systemId: ObjectId, symbolIds: ObjectId[]): Promise<Record<string, SymbolEntity>> {
    const symbols = await this.symbolRepository.findBy({
      _id: {
        $in: symbolIds
      },
      systemId
    });

    const symbolDictionary = symbols.reduce((dictionary: Record<string, SymbolEntity>, symbol: SymbolEntity): Record<string, SymbolEntity> => {
      const { _id } = symbol;

      dictionary[_id.toString()] = symbol;

      return dictionary;
    }, {});

    symbolIds.forEach((symbolId: ObjectId): void => {
      if (!symbolDictionary[symbolId.toString()]) {
        throw new SymbolNotFoundException();
      }
    });

    return symbolDictionary;
  }

  readSymbols(containingSystemId: any, payload: any): Promise<[SymbolEntity[], number]> {
    const searchPayload = this.validateService.payloadCheck(payload, SearchPayload);
    const systemId = this.validateService.idCheck(containingSystemId);

    const { page, count, keywords, types } = searchPayload;
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
};
