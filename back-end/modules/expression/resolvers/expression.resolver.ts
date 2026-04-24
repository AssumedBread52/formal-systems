import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { PaginatedExpressionsPayload } from '@/expression/payloads/paginated-expressions.payload';
import { SearchExpressionsPayload } from '@/expression/payloads/search-expressions.payload';
import { ExpressionReadService } from '@/expression/services/expression-read.service';
import { ParseUUIDPipe, ValidationPipe } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class ExpressionResolver {
  public constructor(private readonly expressionReadService: ExpressionReadService) {
  }

  @Query((): typeof ExpressionEntity => {
    return ExpressionEntity;
  })
  public expression(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('expressionId', new ParseUUIDPipe()) expressionId: string): Promise<ExpressionEntity> {
    return this.expressionReadService.selectById(systemId, expressionId);
  }

  @Query((): typeof PaginatedExpressionsPayload => {
    return PaginatedExpressionsPayload;
  })
  public expressions(@Args('systemId', new ParseUUIDPipe()) systemId: string, @Args('filters', new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true })) searchExpressionsPayload: SearchExpressionsPayload): Promise<PaginatedExpressionsPayload> {
    return this.expressionReadService.searchExpressions(systemId, searchExpressionsPayload);
  }
};
