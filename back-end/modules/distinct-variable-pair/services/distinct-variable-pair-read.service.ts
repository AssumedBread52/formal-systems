import { validatePayload } from '@/common/helpers/validate-payload';
import { DistinctVariablePairEntity } from '@/distinct-variable-pair/entities/distinct-variable-pair.entity';
import { DistinctVariablePairNotFoundException } from '@/distinct-variable-pair/exceptions/distinct-variable-pair-not-found.exception';
import { PaginatedDistinctVariablePairsPayload } from '@/distinct-variable-pair/payloads/paginated-distinct-variable-pairs.payload';
import { SearchDistinctVariablePairsPayload } from '@/distinct-variable-pair/payloads/search-distinct-variable-pairs.payload';
import { DistinctVariablePairRepository } from '@/distinct-variable-pair/repositories/distinct-variable-pair.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class DistinctVariablePairReadService {
  public constructor(private readonly distinctVariablePairRepository: DistinctVariablePairRepository) {
  }

  public async searchDistinctVariablePairs(systemId: string, searchDistinctVariablePairsPayload: SearchDistinctVariablePairsPayload): Promise<PaginatedDistinctVariablePairsPayload> {
    try {
      const validatedSearchDistinctVariablePairsPayload = validatePayload(searchDistinctVariablePairsPayload, SearchDistinctVariablePairsPayload);

      const take = validatedSearchDistinctVariablePairsPayload.pageSize;
      const skip = (validatedSearchDistinctVariablePairsPayload.page - 1) * validatedSearchDistinctVariablePairsPayload.pageSize;

      const [distinctVariablePairs, total] = await this.distinctVariablePairRepository.findAndCount({
        skip,
        take,
        systemId,
        mustIncludeVariableSymbolIds: validatedSearchDistinctVariablePairsPayload.mustIncludeVariableSymbolIds,
        mayIncludeVariableSymbolIds: validatedSearchDistinctVariablePairsPayload.mayIncludeVariableSymbolIds
      });

      return new PaginatedDistinctVariablePairsPayload(distinctVariablePairs, total);
    } catch {
      throw new InternalServerErrorException('Reading distinct variable pairs failed');
    }
  }

  public async selectById(systemId: string, distinctVariablePairId: string): Promise<DistinctVariablePairEntity> {
    try {
      const distinctVariablePair = await this.distinctVariablePairRepository.findOneBy({
        id: distinctVariablePairId,
        systemId
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
};
