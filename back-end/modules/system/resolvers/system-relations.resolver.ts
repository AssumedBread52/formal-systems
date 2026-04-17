import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionLoadingService } from '@/expression/services/expression-loading.service';
import { ExpressionTokenLoadingService } from '@/expression/services/expression-token-loading.service';
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
  public constructor(private readonly expressionLoadingService: ExpressionLoadingService, private readonly expressionTokenLoadingService: ExpressionTokenLoadingService, private readonly symbolLoadingService: SymbolLoadingService, private readonly userLoadingService: UserLoadingService) {
  }

  @ResolveField((): [typeof ExpressionEntity] => {
    return [ExpressionEntity];
  })
  public expressions(@Parent() system: SystemEntity): Promise<ExpressionEntity[]> {
    return this.expressionLoadingService.loaderBySystemIds.load(system.id);
  }

  @ResolveField((): [typeof ExpressionTokenEntity] => {
    return [ExpressionTokenEntity];
  })
  public expressionTokens(@Parent() system: SystemEntity): Promise<ExpressionTokenEntity[]> {
    return this.expressionTokenLoadingService.loaderBySystemIds.load(system.id);
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
