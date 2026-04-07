import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolsBySystemService } from '@/symbol/services/symbols-by-system.service';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { UserBySystemService } from '@/user/services/user-by-system.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof SystemEntity => {
  return SystemEntity;
})
export class RelationsResolver {
  public constructor(private readonly symbolsBySystemService: SymbolsBySystemService, private readonly userBySystemService: UserBySystemService) {
  }

  @ResolveField((): typeof UserEntity => {
    return UserEntity;
  })
  public owner(@Parent() system: SystemEntity): Promise<UserEntity> {
    return this.userBySystemService.loader.load(system.ownerUserId);
  }

  @ResolveField((): [typeof SymbolEntity] => {
    return [SymbolEntity];
  })
  public symbols(@Parent() system: SystemEntity): Promise<SymbolEntity[]> {
    return this.symbolsBySystemService.loader.load(system.id);
  }
};
