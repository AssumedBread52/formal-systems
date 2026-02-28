import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { NewExpressionPayload } from '@/expression/payloads/new-expression.payload';
import { PaginatedExpressionsPayload } from '@/expression/payloads/paginated-expressions.payload';
import { SearchExpressionsPayload } from '@/expression/payloads/search-expressions.payload';
import { ExpressionReadService } from '@/expression/services/expression-read.service';
import { ExpressionWriteService } from '@/expression/services/expression-write.service';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class ExpressionResolver {
  public constructor(private readonly expressionReadService: ExpressionReadService, private readonly expressionWriteService: ExpressionWriteService) {
  }

  @Mutation((): typeof ExpressionEntity => {
    return ExpressionEntity;
  })
  @UseGuards(JwtGuard)
  public createExpression(@SessionUser('id') sessionUserId: string, @Args('systemId') systemId: string, @Args('expressionPayload', new ValidationPipe({ transform: true })) newExpressionPayload: NewExpressionPayload): Promise<ExpressionEntity> {
    return this.expressionWriteService.create(sessionUserId, systemId, newExpressionPayload);
  }

  @Mutation((): typeof ExpressionEntity => {
    return ExpressionEntity;
  })
  @UseGuards(JwtGuard)
  public deleteExpression(@SessionUser('id') sessionUserId: string, @Args('systemId') systemId: string, @Args('expressionId') expressionId: string): Promise<ExpressionEntity> {
    return this.expressionWriteService.delete(sessionUserId, systemId, expressionId);
  }

  @Query((): typeof ExpressionEntity => {
    return ExpressionEntity;
  })
  public expression(@Args('systemId') systemId: string, @Args('expressionId') expressionId: string): Promise<ExpressionEntity> {
    return this.expressionReadService.selectById(systemId, expressionId);
  }

  @Query((): typeof PaginatedExpressionsPayload => {
    return PaginatedExpressionsPayload;
  })
  public expressions(@Args('systemId') systemId: string, @Args('filters', new ValidationPipe({ transform: true })) searchExpressionsPayload: SearchExpressionsPayload): Promise<PaginatedExpressionsPayload> {
    return this.expressionReadService.searchExpressions(systemId, searchExpressionsPayload);
  }
};
