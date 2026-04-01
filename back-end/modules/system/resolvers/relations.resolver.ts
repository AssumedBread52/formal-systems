import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { UserBySystemService } from '@/user/services/user-by-system.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof SystemEntity => {
  return SystemEntity;
})
export class RelationsResolver {
  public constructor(private readonly userBySystemService: UserBySystemService) {
  }

  @ResolveField((): typeof UserEntity => {
    return UserEntity;
  })
  owner(@Parent() system: SystemEntity): Promise<UserEntity> {
    return this.userBySystemService.loader.load(system.ownerUserId);
  }
};
