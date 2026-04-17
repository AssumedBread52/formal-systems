import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemLoadingService } from '@/system/services/system-loading.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof SymbolEntity => {
  return SymbolEntity;
})
export class SymbolRelationsResolver {
  public constructor(private readonly systemLoadingService: SystemLoadingService) {
  }

  @ResolveField((): typeof SystemEntity => {
    return SystemEntity;
  })
  public system(@Parent() symbol: SymbolEntity): Promise<SystemEntity> {
    return this.systemLoadingService.loaderByIds.load(symbol.systemId);
  }
};
