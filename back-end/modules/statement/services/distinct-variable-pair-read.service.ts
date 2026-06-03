import { validatePayload } from '@/common/helpers/validate-payload';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { DistinctVariablePairNotFoundException } from '@/statement/exceptions/distinct-variable-pair-not-found.exception';
import { UniqueVariablePairException } from '@/statement/exceptions/unique-variable-pair.exception';
import { PaginatedDistinctVariablePairsPayload } from '@/statement/payloads/paginated-distinct-variable-pairs.payload';
import { SearchDistinctVariablePairsPayload } from '@/statement/payloads/search-distinct-variable-pairs.payload';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, FindOptionsWhere, In, Not, Repository } from 'typeorm';

@Injectable()
export class DistinctVariablePairReadService {
  public constructor(@InjectRepository(DistinctVariablePairEntity) private readonly repository: Repository<DistinctVariablePairEntity>) {
  }

  public async searchDistinctVariablePairs(systemId: string, statementId: string, searchDistinctVariablePairsPayload: SearchDistinctVariablePairsPayload): Promise<PaginatedDistinctVariablePairsPayload> {
    try {
      const validatedSearchDistinctVariablePairsPayload = validatePayload(searchDistinctVariablePairsPayload, SearchDistinctVariablePairsPayload);

      const take = validatedSearchDistinctVariablePairsPayload.pageSize;
      const skip = (validatedSearchDistinctVariablePairsPayload.page - 1) * validatedSearchDistinctVariablePairsPayload.pageSize;

      const where = [] as FindOptionsWhere<DistinctVariablePairEntity>[];
      const includeFilter = In(validatedSearchDistinctVariablePairsPayload.includeSymbolIds);
      const excludeFilter = Not(In(validatedSearchDistinctVariablePairsPayload.excludeSymbolIds));
      if (0 < validatedSearchDistinctVariablePairsPayload.includeSymbolIds.length && 0 < validatedSearchDistinctVariablePairsPayload.excludeSymbolIds.length) {
        where.push({
          systemId,
          statementId,
          variableSymbol1Id: And(excludeFilter, includeFilter),
          variableSymbol2Id: excludeFilter
        });
        where.push({
          systemId,
          statementId,
          variableSymbol1Id: excludeFilter,
          variableSymbol2Id: And(excludeFilter, includeFilter)
        });
      } else if (0 < validatedSearchDistinctVariablePairsPayload.includeSymbolIds.length) {
        where.push({
          systemId,
          statementId,
          variableSymbol1Id: includeFilter
        });
        where.push({
          systemId,
          statementId,
          variableSymbol2Id: includeFilter
        });
      } else if (0 < validatedSearchDistinctVariablePairsPayload.excludeSymbolIds.length) {
        where.push({
          systemId,
          statementId,
          variableSymbol1Id: excludeFilter,
          variableSymbol2Id: excludeFilter
        });
      } else {
        where.push({
          systemId,
          statementId
        });
      }

      const [distinctVariablePairs, total] = await this.repository.findAndCount({
        skip,
        take,
        where
      });

      return new PaginatedDistinctVariablePairsPayload(distinctVariablePairs, total);
    } catch {
      throw new InternalServerErrorException('Reading distinct variable pairs failed');
    }
  }

  public async selectById(systemId: string, statementId: string, unorderedVariableSymbol1Id: string, unorderedVariableSymbol2Id: string): Promise<DistinctVariablePairEntity> {
    try {
      const [variableSymbol1Id, variableSymbol2Id] = this.orderIds(unorderedVariableSymbol1Id, unorderedVariableSymbol2Id);

      const distinctVariablePair = await this.repository.findOneBy({
        systemId,
        statementId,
        variableSymbol1Id,
        variableSymbol2Id
      });

      if (!distinctVariablePair) {
        throw new DistinctVariablePairNotFoundException();
      }

      return distinctVariablePair;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading distinct variable pair failed');
    }
  }

  public async verifyUniqueVariablePair(statementId: string, unorderedVariableSymbol1Id: string, unorderedVariableSymbol2Id: string): Promise<void> {
    try {
      const [variableSymbol1Id, variableSymbol2Id] = this.orderIds(unorderedVariableSymbol1Id, unorderedVariableSymbol2Id);

      const conflict = await this.repository.existsBy({
        statementId,
        variableSymbol1Id,
        variableSymbol2Id
      });

      if (conflict) {
        throw new UniqueVariablePairException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying unique variable pair failed');
    }
  }

  private orderIds(unorderedId1: string, unorderedId2: string): [string, string] {
    if (unorderedId1 < unorderedId2) {
      return [unorderedId1, unorderedId2];
    } else {
      return [unorderedId2, unorderedId1];
    }
  }
};
