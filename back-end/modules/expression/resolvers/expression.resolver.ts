import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionReadService } from '@/expression/services/expression-read.service';
import { ParseUUIDPipe } from '@nestjs/common';
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
};
