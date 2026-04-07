import { validatePayload } from '@/common/helpers/validate-payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { PaginatedSymbolsPayload } from '@/symbol/payloads/paginated-symbols.payload';
import { SearchSymbolsPayload } from '@/symbol/payloads/search-symbols.payload';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';

@Injectable()
export class SymbolReadService {
  public constructor(@InjectRepository(SymbolEntity) private readonly repository: Repository<SymbolEntity>) {
  }

  public async searchSymbols(systemId: string, searchSymbolsPayload: SearchSymbolsPayload): Promise<PaginatedSymbolsPayload> {
    try {
      const validatedSearchSymbolsPayload = validatePayload(searchSymbolsPayload, SearchSymbolsPayload);

      const take = validatedSearchSymbolsPayload.pageSize;
      const skip = (validatedSearchSymbolsPayload.page - 1) * validatedSearchSymbolsPayload.pageSize;

      const where = [] as FindOptionsWhere<SymbolEntity>[];
      const textFilter = ILike(`%${validatedSearchSymbolsPayload.searchText}%`);
      const typeFilter = In(validatedSearchSymbolsPayload.types);
      if (0 < validatedSearchSymbolsPayload.searchText.length && 0 < validatedSearchSymbolsPayload.types.length) {
        where.push({
          systemId,
          name: textFilter,
          type: typeFilter
        });
        where.push({
          systemId,
          description: textFilter,
          type: typeFilter
        });
        where.push({
          systemId,
          type: typeFilter,
          content: textFilter
        });
      } else if (0 < validatedSearchSymbolsPayload.searchText.length) {
        where.push({
          systemId,
          name: textFilter
        });
        where.push({
          systemId,
          description: textFilter
        });
        where.push({
          systemId,
          type: typeFilter
        });
      } else if (0 < validatedSearchSymbolsPayload.types.length) {
        where.push({
          systemId,
          type: typeFilter
        });
      }

      const [symbols, total] = await this.repository.findAndCount({
        skip,
        take,
        where
      });

      return new PaginatedSymbolsPayload(symbols, total);
    } catch {
      throw new InternalServerErrorException('Reading symbols failed');
    }
  }

  public async selectById(systemId: string, symbolId: string): Promise<SymbolEntity> {
    try {
      const symbol = await this.repository.findOneBy({
        id: symbolId,
        systemId
      });

      if (!symbol) {
        throw new SymbolNotFoundException();
      }

      return validatePayload(symbol, SymbolEntity);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading symbol failed');
    }
  }
};
