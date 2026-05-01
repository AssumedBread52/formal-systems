import { StatementEntity } from '@/statement/entities/statement.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemLoadingService } from '@/system/services/system-loading.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof StatementEntity => {
  return StatementEntity;
})
export class StatementRelationsResolver {
  public constructor(private readonly systemLoadingService: SystemLoadingService) {
  }

  @ResolveField((): typeof SystemEntity => {
    return SystemEntity;
  })
  public system(@Parent() statement: StatementEntity): Promise<SystemEntity> {
    return this.systemLoadingService.loaderByIds.load(statement.systemId);
  }
};
