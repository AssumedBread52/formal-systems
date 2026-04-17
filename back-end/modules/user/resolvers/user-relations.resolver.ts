import { SystemEntity } from '@/system/entities/system.entity';
import { SystemsByOwnerService } from '@/system/services/systems-by-owner.service';
import { UserEntity } from '@/user/entities/user.entity';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof UserEntity => {
  return UserEntity;
})
export class UserRelationsResolver {
  public constructor(private readonly systemsByOwnerService: SystemsByOwnerService) {
  }

  @ResolveField((): [typeof SystemEntity] => {
    return [SystemEntity];
  })
  public systems(@Parent() user: UserEntity): Promise<SystemEntity[]> {
    return this.systemsByOwnerService.loader.load(user.id);
  }
};
