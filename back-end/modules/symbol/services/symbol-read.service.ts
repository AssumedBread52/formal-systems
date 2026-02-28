import { validatePayload } from '@/common/helpers/validate-payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { PaginatedSymbolsPayload } from '@/symbol/payloads/paginated-symbols.payload';
import { SearchSymbolsPayload } from '@/symbol/payloads/search-symbols.payload';
import { SymbolRepository } from '@/symbol/repositories/symbol.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class SymbolReadService {
  public constructor(private readonly symbolRepository: SymbolRepository) {
  }

  public async searchSymbols(systemId: string, searchSymbolsPayload: SearchSymbolsPayload): Promise<PaginatedSymbolsPayload> {
    try {
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

  public async selectByIds(systemId: string, symbolIds: string[]): Promise<SymbolEntity[]> {
    try {
      const uniqueSymbolIds = symbolIds.reduce((uniqueIds: string[], symbolId: string): string[] => {
        if (!uniqueIds.includes(symbolId)) {
          uniqueIds.push(symbolId);
        }

        return uniqueIds;
      }, []);

      const symbols = await this.symbolRepository.find({
        ids: uniqueSymbolIds,
        systemId
      });

      return symbolIds.map((symbolId: string): SymbolEntity => {
        const symbol = symbols.find((symbol: SymbolEntity): boolean => {
          return symbol.id === symbolId;
        });

        if (!symbol) {
          throw new SymbolNotFoundException();
        }

        return symbol;
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading symbols failed');
    }
  }
};
