import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { ExpressionTokenLoadingService } from '@/expression/services/expression-token-loading.service';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { DistinctVariablePairLoadingService } from '@/statement/services/distinct-variable-pair-loading.service';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemLoadingService } from '@/system/services/system-loading.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof SymbolEntity => {
  return SymbolEntity;
})
export class SymbolRelationsResolver {
  public constructor(private readonly distinctVariablePairLoadingService: DistinctVariablePairLoadingService, private readonly expressionTokenLoadingService: ExpressionTokenLoadingService, private readonly systemLoadingService: SystemLoadingService) {
  }

  @ResolveField()
  public distinctVariable1Pairs(@Parent() symbol: SymbolEntity): Promise<DistinctVariablePairEntity[]> {
    return this.distinctVariablePairLoadingService.loadByVariableSymbol1Id(symbol.id);
  }

  @ResolveField()
  public distinctVariable2Pairs(@Parent() symbol: SymbolEntity): Promise<DistinctVariablePairEntity[]> {
    return this.distinctVariablePairLoadingService.loadByVariableSymbol2Id(symbol.id);
  }

  @ResolveField()
  public expressionTokens(@Parent() symbol: SymbolEntity): Promise<ExpressionTokenEntity[]> {
    return this.expressionTokenLoadingService.loadBySymbolId(symbol.id);
  }

  @ResolveField()
  public system(@Parent() symbol: SymbolEntity): Promise<SystemEntity> {
    return this.systemLoadingService.loadById(symbol.systemId);
  }
};
