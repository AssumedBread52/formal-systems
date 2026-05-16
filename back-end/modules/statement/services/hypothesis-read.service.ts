import { validatePayload } from '@/common/helpers/validate-payload';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { HypothesisNotFoundException } from '@/statement/exceptions/hypothesis-not-found.exception';
import { VariableSymbolNotTypedException } from '@/statement/exceptions/variable-symbol-not-typed.exception';
import { PaginatedHypothesesPayload } from '@/statement/payloads/paginated-hypotheses.payload';
import { SearchHypothesesPayload } from '@/statement/payloads/search-hypotheses.payload';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';

@Injectable()
export class HypothesisReadService {
  public constructor(@InjectRepository(HypothesisEntity) private readonly repository: Repository<HypothesisEntity>) {
  }

  public async searchHypotheses(systemId: string, statementId: string, searchHypothesesPayload: SearchHypothesesPayload): Promise<PaginatedHypothesesPayload> {
    try {
      const validatedSearchHypothesesPayload = validatePayload(searchHypothesesPayload, SearchHypothesesPayload);

      const take = validatedSearchHypothesesPayload.pageSize;
      const skip = (validatedSearchHypothesesPayload.page - 1) * validatedSearchHypothesesPayload.pageSize;

      const where = {
        systemId,
        statementId,
      } as FindOptionsWhere<HypothesisEntity>;
      if (0 < validatedSearchHypothesesPayload.types.length) {
        where.type = In(validatedSearchHypothesesPayload.types);
      }

      const [hypotheses, total] = await this.repository.findAndCount({
        skip,
        take,
        where
      });

      return new PaginatedHypothesesPayload(hypotheses, total);
    } catch {
      throw new InternalServerErrorException('Reading hypotheses failed');
    }
  }

  public async selectById(systemId: string, statementId: string, hypothesisId: string): Promise<HypothesisEntity> {
    try {
      const hypothesis = await this.repository.findOneBy({
        id: hypothesisId,
        systemId,
        statementId
      });

      if (!hypothesis) {
        throw new HypothesisNotFoundException();
      }

      return hypothesis;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading hypothesis failed');
    }
  }

  public async verifyAllSymbolsTyped(systemId: string, statementId: string, variableSymbolIds: string[]): Promise<void> {
    try {
      const uniqueVariableSymbolIds = variableSymbolIds.reduce((uniqueVariableSymbolIds: string[], variableSymbolId: string): string[] => {
        if (!uniqueVariableSymbolIds.includes(variableSymbolId)) {
          uniqueVariableSymbolIds.push(variableSymbolId);
        }

        return uniqueVariableSymbolIds;
      }, []);

      const count = await this.repository.countBy({
        systemId,
        statementId,
        type: HypothesisType.type,
        expression: {
          expressionTokens: {
            symbolId: In(uniqueVariableSymbolIds),
            position: 1
          }
        }
      });

      if (count !== uniqueVariableSymbolIds.length) {
        throw new VariableSymbolNotTypedException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying symbols are typed failed');
    }
  }
};
