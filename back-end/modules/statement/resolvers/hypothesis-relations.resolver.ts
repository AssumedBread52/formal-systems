import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionLoadingService } from '@/expression/services/expression-loading.service';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { StatementLoadingService } from '@/statement/services/statement-loading.service';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemLoadingService } from '@/system/services/system-loading.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof HypothesisEntity => {
  return HypothesisEntity;
})
export class HypothesisRelationsResolver {
  public constructor(private readonly expressionLoadingService: ExpressionLoadingService, private readonly statementLoadingService: StatementLoadingService, private readonly systemLoadingService: SystemLoadingService) {
  }

  @ResolveField()
  public expression(@Parent() hypothesis: HypothesisEntity): Promise<ExpressionEntity> {
    return this.expressionLoadingService.loadById(hypothesis.expressionId);
  }

  @ResolveField()
  public statement(@Parent() hypothesis: HypothesisEntity): Promise<StatementEntity> {
    return this.statementLoadingService.loadById(hypothesis.statementId);
  }

  @ResolveField()
  public system(@Parent() hypothesis: HypothesisEntity): Promise<SystemEntity> {
    return this.systemLoadingService.loadById(hypothesis.systemId);
  }
};
