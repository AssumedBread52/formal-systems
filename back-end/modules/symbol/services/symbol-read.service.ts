import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { SearchPayload } from '@/symbol/payloads/search.payload';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository, RootFilterOperators } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class SymbolReadService {
  constructor(@InjectRepository(SymbolEntity) private symbolRepository: MongoRepository<SymbolEntity>, private validateService: ValidateService) {
  }

  async addToSymbolDictionary(systemId: ObjectId, symbolIds: ObjectId[], symbolDictionary: Record<string, SymbolEntity>): Promise<Record<string, SymbolEntity>> {
    const missingSymbolIds = symbolIds.filter((symbolId: ObjectId): boolean => {
      if (symbolDictionary[symbolId.toString()]) {
        return false;
      }

      return true;
    });

    const missingSymbols = await this.symbolRepository.find({
      where: {
        _id: {
          $in: missingSymbolIds
        },
        systemId
      }
    });

    const newSymbolDictionary = missingSymbols.reduce((dictionary: Record<string, SymbolEntity>, missingSymbol: SymbolEntity): Record<string, SymbolEntity> => {
      const { _id } = missingSymbol;

      dictionary[_id.toString()] = missingSymbol;

      return dictionary;
    }, symbolDictionary);

    missingSymbolIds.forEach((missingSymbolId: ObjectId): void => {
      if (!newSymbolDictionary[missingSymbolId.toString()]) {
        throw new SymbolNotFoundException();
      }
    });

    return newSymbolDictionary;
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
      where['type'] = {
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
