import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { ExpressionTokenLoadingService } from '@/expression/services/expression-token-loading.service';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemLoadingService } from '@/system/services/system-loading.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof SymbolEntity => {
  return SymbolEntity;
})
export class SymbolRelationsResolver {
  public constructor(private readonly expressionTokenLoadingService: ExpressionTokenLoadingService, private readonly systemLoadingService: SystemLoadingService) {
  }

  @ResolveField((): [typeof ExpressionTokenEntity] => {
    return [ExpressionTokenEntity];
  })
  public expressionTokens(@Parent() symbol: SymbolEntity): Promise<ExpressionTokenEntity[]> {
    return this.expressionTokenLoadingService.loaderBySymbolIds.load(symbol.id);
  }

  @ResolveField((): typeof SystemEntity => {
    return SystemEntity;
  })
  public system(@Parent() symbol: SymbolEntity): Promise<SystemEntity> {
    return this.systemLoadingService.loaderByIds.load(symbol.systemId);
  }
};
