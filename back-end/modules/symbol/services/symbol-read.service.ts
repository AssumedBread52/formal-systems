import { validatePayload } from '@/common/helpers/validate-payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { PaginatedSymbolsPayload } from '@/symbol/payloads/paginated-symbols.payload';
import { SearchSymbolsPayload } from '@/symbol/payloads/search-symbols.payload';
import { SymbolRepository } from '@/symbol/repositories/symbol.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { isMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

@Injectable()
export class SymbolReadService {
  public constructor(private readonly symbolRepository: SymbolRepository) {
  }

  public async searchSymbols(systemId: string, searchSymbolsPayload: SearchSymbolsPayload): Promise<PaginatedSymbolsPayload> {
    try {
      if (!isMongoId(systemId)) {
        throw new Error('Invalid system ID');
      }

      const validatedSearchSymbolsPayload = validatePayload(searchSymbolsPayload, SearchSymbolsPayload);

      const take = validatedSearchSymbolsPayload.pageSize;
      const skip = (validatedSearchSymbolsPayload.page - 1) * validatedSearchSymbolsPayload.pageSize;

      const [symbols, total] = await this.symbolRepository.findAndCount({
        skip,
        take,
        systemId,
        keywords: validatedSearchSymbolsPayload.keywords,
        types: validatedSearchSymbolsPayload.types
      });

      return new PaginatedSymbolsPayload(symbols, total);
    } catch {
      throw new InternalServerErrorException('Reading symbols failed');
    }
  }

  public async selectById(systemId: string, symbolId: string): Promise<SymbolEntity> {
    try {
      if (!isMongoId(systemId)) {
        throw new Error('Invalid system ID');
      }

      if (!isMongoId(symbolId)) {
        throw new Error('Invalid symbol ID');
      }

      const symbol = await this.symbolRepository.findOneBy({
        id: symbolId,
        systemId
      });

      if (!symbol) {
        throw new SymbolNotFoundException();
      }

      return symbol;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading symbol failed');
    }
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
      const { id } = missingSymbol;

      dictionary[id] = missingSymbol;

      return dictionary;
    }, symbolDictionary);

    missingSymbolIds.forEach((missingSymbolId: ObjectId): void => {
      if (!newSymbolDictionary[missingSymbolId.toString()]) {
        throw new SymbolNotFoundException();
      }
    });

    return newSymbolDictionary;
  }
};
