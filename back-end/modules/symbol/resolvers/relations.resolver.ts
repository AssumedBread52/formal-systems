import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemBySymbolService } from '@/system/services/system-by-symbol.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof SymbolEntity => {
  return SymbolEntity;
})
export class RelationsResolver {
  public constructor(private readonly systemBySymbolService: SystemBySymbolService) {
  }

  @ResolveField((): typeof SystemEntity => {
    return SystemEntity;
  })
  public system(@Parent() symbol: SymbolEntity): Promise<SystemEntity> {
    return this.systemBySymbolService.loader.load(symbol.systemId);
  }
};
