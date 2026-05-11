import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionLoadingService } from '@/expression/services/expression-loading.service';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { HypothesisLoadingService } from '@/statement/services/hypothesis-loading.service';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemLoadingService } from '@/system/services/system-loading.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof StatementEntity => {
  return StatementEntity;
})
export class StatementRelationsResolver {
  public constructor(private readonly expressionLoadingService: ExpressionLoadingService, private readonly hypothesisLoadingService: HypothesisLoadingService, private readonly systemLoadingService: SystemLoadingService) {
  }

  @ResolveField((): typeof ExpressionEntity => {
    return ExpressionEntity;
  })
  public assertion(@Parent() statement: StatementEntity): Promise<ExpressionEntity> {
    return this.expressionLoadingService.loaderByIds.load(statement.assertionExpressionId);
  }

  @ResolveField((): [typeof HypothesisEntity] => {
    return [HypothesisEntity];
  })
  public hypotheses(@Parent() statement: StatementEntity): Promise<HypothesisEntity[]> {
    return this.hypothesisLoadingService.loaderByStatementIds.load(statement.id);
  }

  @ResolveField((): typeof SystemEntity => {
    return SystemEntity;
  })
  public system(@Parent() statement: StatementEntity): Promise<SystemEntity> {
    return this.systemLoadingService.loaderByIds.load(statement.systemId);
  }
};
