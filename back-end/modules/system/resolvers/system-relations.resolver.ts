import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionLoadingService } from '@/expression/services/expression-loading.service';
import { ExpressionTokenLoadingService } from '@/expression/services/expression-token-loading.service';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { DistinctVariablePairLoadingService } from '@/statement/services/distinct-variable-pair-loading.service';
import { HypothesisLoadingService } from '@/statement/services/hypothesis-loading.service';
import { StatementLoadingService } from '@/statement/services/statement-loading.service';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolLoadingService } from '@/symbol/services/symbol-loading.service';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { UserLoadingService } from '@/user/services/user-loading.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof SystemEntity => {
  return SystemEntity;
})
export class SystemRelationsResolver {
  public constructor(private readonly distinctVariablePairLoadingService: DistinctVariablePairLoadingService, private readonly expressionLoadingService: ExpressionLoadingService, private readonly expressionTokenLoadingService: ExpressionTokenLoadingService, private readonly hypothesisLoadingService: HypothesisLoadingService, private readonly statementLoadingService: StatementLoadingService, private readonly symbolLoadingService: SymbolLoadingService, private readonly userLoadingService: UserLoadingService) {
  }

  @ResolveField((): [typeof DistinctVariablePairEntity] => {
    return [DistinctVariablePairEntity];
  })
  public distinctVariablePairs(@Parent() system: SystemEntity): Promise<DistinctVariablePairEntity[]> {
    return this.distinctVariablePairLoadingService.loaderBySystemIds.load(system.id);
  }

  @ResolveField((): [typeof ExpressionEntity] => {
    return [ExpressionEntity];
  })
  public expressions(@Parent() system: SystemEntity): Promise<ExpressionEntity[]> {
    return this.expressionLoadingService.loadBySystemId(system.id);
  }

  @ResolveField((): [typeof ExpressionTokenEntity] => {
    return [ExpressionTokenEntity];
  })
  public expressionTokens(@Parent() system: SystemEntity): Promise<ExpressionTokenEntity[]> {
    return this.expressionTokenLoadingService.loadBySystemId(system.id);
  }

  @ResolveField((): [typeof HypothesisEntity] => {
    return [HypothesisEntity];
  })
  public hypotheses(@Parent() system: SystemEntity): Promise<HypothesisEntity[]> {
    return this.hypothesisLoadingService.loadBySystemId(system.id);
  }

  @ResolveField((): typeof UserEntity => {
    return UserEntity;
  })
  public owner(@Parent() system: SystemEntity): Promise<UserEntity> {
    return this.userLoadingService.loadById(system.ownerUserId);
  }

  @ResolveField((): [typeof StatementEntity] => {
    return [StatementEntity];
  })
  public statements(@Parent() system: SystemEntity): Promise<StatementEntity[]> {
    return this.statementLoadingService.loadBySystemId(system.id);
  }

  @ResolveField((): [typeof SymbolEntity] => {
    return [SymbolEntity];
  })
  public symbols(@Parent() system: SystemEntity): Promise<SymbolEntity[]> {
    return this.symbolLoadingService.loadBySystemId(system.id);
  }
};
