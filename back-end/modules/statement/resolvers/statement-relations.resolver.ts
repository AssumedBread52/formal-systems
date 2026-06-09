import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionLoadingService } from '@/expression/services/expression-loading.service';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { DistinctVariablePairLoadingService } from '@/statement/services/distinct-variable-pair-loading.service';
import { HypothesisLoadingService } from '@/statement/services/hypothesis-loading.service';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemLoadingService } from '@/system/services/system-loading.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof StatementEntity => {
  return StatementEntity;
})
export class StatementRelationsResolver {
  public constructor(private readonly distinctVariablePairLoadingService: DistinctVariablePairLoadingService, private readonly expressionLoadingService: ExpressionLoadingService, private readonly hypothesisLoadingService: HypothesisLoadingService, private readonly systemLoadingService: SystemLoadingService) {
  }

  @ResolveField()
  public assertion(@Parent() statement: StatementEntity): Promise<ExpressionEntity> {
    return this.expressionLoadingService.loadById(statement.assertionExpressionId);
  }

  @ResolveField()
  public distinctVariablePairs(@Parent() statement: StatementEntity): Promise<DistinctVariablePairEntity[]> {
    return this.distinctVariablePairLoadingService.loadByStatementId(statement.id);
  }

  @ResolveField()
  public hypotheses(@Parent() statement: StatementEntity): Promise<HypothesisEntity[]> {
    return this.hypothesisLoadingService.loadByStatementId(statement.id);
  }

  @ResolveField()
  public system(@Parent() statement: StatementEntity): Promise<SystemEntity> {
    return this.systemLoadingService.loadById(statement.systemId);
  }
};
