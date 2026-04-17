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
  public constructor(private readonly symbolLoadingService: SymbolLoadingService, private readonly userLoadingService: UserLoadingService) {
  }

  @ResolveField((): typeof UserEntity => {
    return UserEntity;
  })
  public owner(@Parent() system: SystemEntity): Promise<UserEntity> {
    return this.userLoadingService.loaderByIds.load(system.ownerUserId);
  }

  @ResolveField((): [typeof SymbolEntity] => {
    return [SymbolEntity];
  })
  public symbols(@Parent() system: SystemEntity): Promise<SymbolEntity[]> {
    return this.symbolLoadingService.loaderBySystemIds.load(system.id);
  }
};
