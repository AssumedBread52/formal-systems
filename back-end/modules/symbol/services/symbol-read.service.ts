import { validatePayload } from '@/common/helpers/validate-payload';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { InvalidSymbolTypeException } from '@/symbol/exceptions/invalid-symbol-type.exception';
import { SymbolNotFoundException } from '@/symbol/exceptions/symbol-not-found.exception';
import { SymbolTypeNotChangeableException } from '@/symbol/exceptions/symbol-type-not-changeable.exception';
import { UniqueNameException } from '@/symbol/exceptions/unique-name.exception';
import { PaginatedSymbolsPayload } from '@/symbol/payloads/paginated-symbols.payload';
import { SearchSymbolsPayload } from '@/symbol/payloads/search-symbols.payload';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, ILike, In, IsNull, Not, Repository } from 'typeorm';

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
          content: textFilter
        });
      } else if (0 < validatedSearchSymbolsPayload.types.length) {
        where.push({
          systemId,
          type: typeFilter
        });
      } else {
        where.push({
          systemId
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

      return symbol;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading symbol failed');
    }
  }

  public async selectVariableSymbolIds(systemId: string, expressionId: string): Promise<string[]> {
    try {
      const variableSymbols = await this.repository.findBy({
        type: SymbolType.variable,
        expressionTokens: {
          systemId,
          expressionId
        }
      });

      return variableSymbols.map((variableSymbol: SymbolEntity): string => {
        return variableSymbol.id;
      });
    } catch {
      throw new InternalServerErrorException('Reading the variable symbols from an expression failed');
    }
  }

  public async verifyAllExist(entityManager: EntityManager, systemId: string, symbolIds: string[], type?: SymbolType): Promise<void> {
    try {
      const symbolRepository = entityManager.getRepository(SymbolEntity);

      const uniqueSymbolIds = symbolIds.reduce((uniqueSymbolIds: string[], symbolId: string): string[] => {
        if (!uniqueSymbolIds.includes(symbolId)) {
          uniqueSymbolIds.push(symbolId);
        }

        return uniqueSymbolIds;
      }, []);

      const count = await symbolRepository.countBy({
        id: In(uniqueSymbolIds),
        systemId
      });

      if (count !== uniqueSymbolIds.length) {
        throw new SymbolNotFoundException();
      }

      if (!type) {
        return;
      }

      const typeCount = await symbolRepository.countBy({
        id: In(uniqueSymbolIds),
        systemId,
        type
      });

      if (typeCount !== uniqueSymbolIds.length) {
        throw new InvalidSymbolTypeException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying symbols failed');
    }
  }

  public async verifySymbolTypeChangeable(entityManager: EntityManager, symbolId: string): Promise<void> {
    try {
      const symbolRepository = entityManager.getRepository(SymbolEntity);

      const inUse = await symbolRepository.existsBy({
        id: symbolId,
        expressionTokens: {
          expression: [
            {
              statements: {
                id: Not(IsNull())
              }
            },
            {
              hypotheses: {
                id: Not(IsNull())
              }
            }
          ]
        }
      });

      if (inUse) {
        throw new SymbolTypeNotChangeableException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying symbol type is changeable failed');
    }
  }

  public async verifyUniqueName(systemId: string, name: string): Promise<void> {
    try {
      const conflict = await this.repository.existsBy({
        systemId,
        name
      });

      if (conflict) {
        throw new UniqueNameException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying unique name failed');
    }
  }
};
