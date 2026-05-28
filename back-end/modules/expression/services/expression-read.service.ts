import { validatePayload } from '@/common/helpers/validate-payload';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionInUseException } from '@/expression/exceptions/expression-in-use.exception';
import { ExpressionNotFoundException } from '@/expression/exceptions/expression-not-found.exception';
import { UniqueSymbolSequenceException } from '@/expression/exceptions/unique-symbol-sequence.exception';
import { PaginatedExpressionsPayload } from '@/expression/payloads/paginated-expressions.payload';
import { SearchExpressionsPayload } from '@/expression/payloads/search-expressions.payload';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';

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

  public async verifyExpressionNotInUse(expressionId: string): Promise<void> {
    try {
      const inUse = await this.repository.existsBy([
        {
          id: expressionId,
          statements: {
            id: Not(IsNull())
          }
        },
        {
          id: expressionId,
          hypotheses: {
            id: Not(IsNull())
          }
        }
      ]);

      if (inUse) {
        throw new ExpressionInUseException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying expression not in use failed');
    }
  }

  public async verifyUniqueSymbolSequence(systemId: string, sequence: string[]): Promise<void> {
    try {
      // TypeORM limitation: array columns, in the FindOptionsWhere type, are
      // typed as the element of the array, however, the underlying pg driver
      // correctly constructs the desired query
      const symbolSequenceConflict = await this.repository.existsBy({
        systemId,
        canonical: sequence as any
      });

      if (symbolSequenceConflict) {
        throw new UniqueSymbolSequenceException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying unique symbol sequence failed');
    }
  }
};
