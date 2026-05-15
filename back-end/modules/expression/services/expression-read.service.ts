import { validatePayload } from '@/common/helpers/validate-payload';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionNotFoundException } from '@/expression/exceptions/expression-not-found.exception';
import { PaginatedExpressionsPayload } from '@/expression/payloads/paginated-expressions.payload';
import { SearchExpressionsPayload } from '@/expression/payloads/search-expressions.payload';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class ExpressionReadService {
  public constructor(@InjectRepository(ExpressionEntity) private readonly repository: Repository<ExpressionEntity>) {
  }

  public async searchExpressions(systemId: string, searchExpressionsPayload: SearchExpressionsPayload): Promise<PaginatedExpressionsPayload> {
    try {
      const validatedSearchExpressionsPayload = validatePayload(searchExpressionsPayload, SearchExpressionsPayload);

      const take = validatedSearchExpressionsPayload.pageSize;
      const skip = (validatedSearchExpressionsPayload.page - 1) * validatedSearchExpressionsPayload.pageSize;

      const where = {
        systemId
      } as FindOptionsWhere<ExpressionEntity>;

      if (0 < validatedSearchExpressionsPayload.symbolIds.length) {
        where.canonical = ArrayContains(validatedSearchExpressionsPayload.symbolIds);
      }

      const [expressions, total] = await this.repository.findAndCount({
        skip,
        take,
        where
      });

      return new PaginatedExpressionsPayload(expressions, total);
    } catch {
      throw new InternalServerErrorException('Reading expressions failed');
    }
  }

  public async selectById(systemId: string, expressionId: string): Promise<ExpressionEntity> {
    try {
      const expression = await this.repository.findOneBy({
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
