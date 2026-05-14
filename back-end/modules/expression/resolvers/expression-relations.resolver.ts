import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionTokenLoadingService } from '@/expression/services/expression-token-loading.service';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { HypothesisLoadingService } from '@/statement/services/hypothesis-loading.service';
import { StatementLoadingService } from '@/statement/services/statement-loading.service';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemLoadingService } from '@/system/services/system-loading.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof ExpressionEntity => {
  return ExpressionEntity;
})
export class ExpressionRelationsResolver {
  public constructor(private readonly expressionTokenLoadingService: ExpressionTokenLoadingService, private readonly hypothesisLoadingService: HypothesisLoadingService, private readonly statementLoadingService: StatementLoadingService, private readonly systemLoadingService: SystemLoadingService) {
  }

  @ResolveField((): [typeof ExpressionTokenEntity] => {
    return [ExpressionTokenEntity];
  })
  public expressionTokens(@Parent() expression: ExpressionEntity): Promise<ExpressionTokenEntity[]> {
    return this.expressionTokenLoadingService.loadByExpressionId(expression.id);
  }

  @ResolveField((): [typeof HypothesisEntity] => {
    return [HypothesisEntity];
  })
  public hypotheses(@Parent() expression: ExpressionEntity): Promise<HypothesisEntity[]> {
    return this.hypothesisLoadingService.loadByExpressionId(expression.id);
  }

  @ResolveField((): [typeof StatementEntity] => {
    return [StatementEntity];
  })
  public statements(@Parent() expression: ExpressionEntity): Promise<StatementEntity[]> {
    return this.statementLoadingService.loadByAssertionExpressionId(expression.id);
  }

  @ResolveField((): typeof SystemEntity => {
    return SystemEntity;
  })
  public system(@Parent() expression: ExpressionEntity): Promise<SystemEntity> {
    return this.systemLoadingService.loadById(expression.systemId);
  }
};
