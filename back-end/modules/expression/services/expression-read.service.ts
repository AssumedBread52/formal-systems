import { validatePayload } from '@/common/helpers/validate-payload';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionNotFoundException } from '@/expression/exceptions/expression-not-found.exception';
import { PaginatedExpressionsPayload } from '@/expression/payloads/paginated-expressions.payload';
import { SearchExpressionsPayload } from '@/expression/payloads/search-expressions.payload';
import { ExpressionRepository } from '@/expression/repositories/expression.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ExpressionReadService {
  public constructor(private readonly expressionRepository: ExpressionRepository) {
  }

  public async searchExpressions(systemId: string, searchExpressionsPayload: SearchExpressionsPayload): Promise<PaginatedExpressionsPayload> {
    try {
      const validatedSearchExpressionsPayload = validatePayload(searchExpressionsPayload, SearchExpressionsPayload);

      const take = validatedSearchExpressionsPayload.pageSize;
      const skip = (validatedSearchExpressionsPayload.page - 1) * validatedSearchExpressionsPayload.pageSize;

      const [expressions, total] = await this.expressionRepository.findAndCount({
        skip,
        take,
        systemId,
        mustIncludeSymbolIds: validatedSearchExpressionsPayload.mustIncludeSymbolIds,
        mayIncludeSymbolIds: validatedSearchExpressionsPayload.mayIncludeSymbolIds,
        types: validatedSearchExpressionsPayload.types
      });

      return new PaginatedExpressionsPayload(expressions, total);
    } catch {
      throw new InternalServerErrorException('Reading expressions failed');
    }
  }

  public async selectById(systemId: string, expressionId: string): Promise<ExpressionEntity> {
    try {
      const expression = await this.expressionRepository.findOneBy({
        id: expressionId,
        systemId
      });

      if (!expression) {
        throw new ExpressionNotFoundException();
      }

      return expression;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading expression failed');
    }
  }
};
