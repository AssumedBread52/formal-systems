import { SystemEntity } from '@/system/entities/system.entity';
import { SystemLoadingService } from '@/system/services/system-loading.service';
import { UserEntity } from '@/user/entities/user.entity';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof UserEntity => {
  return UserEntity;
})
export class UserRelationsResolver {
  public constructor(private readonly systemLoadingService: SystemLoadingService) {
  }

  @ResolveField((): [typeof SystemEntity] => {
    return [SystemEntity];
  })
  public systems(@Parent() user: UserEntity): Promise<SystemEntity[]> {
    return this.systemLoadingService.loaderByOwnerUserIds.load(user.id);
  }
};
