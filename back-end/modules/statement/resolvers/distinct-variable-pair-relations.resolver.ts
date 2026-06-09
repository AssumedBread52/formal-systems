import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { StatementLoadingService } from '@/statement/services/statement-loading.service';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolLoadingService } from '@/symbol/services/symbol-loading.service';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemLoadingService } from '@/system/services/system-loading.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof DistinctVariablePairEntity => {
  return DistinctVariablePairEntity;
})
export class DistinctVariablePairRelationsResolver {
  public constructor(private readonly statementLoadingService: StatementLoadingService, private readonly symbolLoadingService: SymbolLoadingService, private readonly systemLoadingService: SystemLoadingService) {
  }

  @ResolveField()
  public statement(@Parent() distinctVariablePair: DistinctVariablePairEntity): Promise<StatementEntity> {
    return this.statementLoadingService.loadById(distinctVariablePair.statementId);
  }

  @ResolveField()
  public system(@Parent() distinctVariablePair: DistinctVariablePairEntity): Promise<SystemEntity> {
    return this.systemLoadingService.loadById(distinctVariablePair.systemId);
  }

  @ResolveField()
  public variableSymbol1(@Parent() distinctVariablePair: DistinctVariablePairEntity): Promise<SymbolEntity> {
    return this.symbolLoadingService.loadById(distinctVariablePair.variableSymbol1Id);
  }

  @ResolveField()
  public variableSymbol2(@Parent() distinctVariablePair: DistinctVariablePairEntity): Promise<SymbolEntity> {
    return this.symbolLoadingService.loadById(distinctVariablePair.variableSymbol2Id);
  }
};
