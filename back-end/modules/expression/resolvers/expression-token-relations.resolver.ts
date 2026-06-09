import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionLoadingService } from '@/expression/services/expression-loading.service';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolLoadingService } from '@/symbol/services/symbol-loading.service';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemLoadingService } from '@/system/services/system-loading.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver((): typeof ExpressionTokenEntity => {
  return ExpressionTokenEntity;
})
export class ExpressionTokenRelationsResolver {
  public constructor(private readonly expressionLoadingService: ExpressionLoadingService, private readonly symbolLoadingService: SymbolLoadingService, private readonly systemLoadingService: SystemLoadingService) {
  }

  @ResolveField()
  public expression(@Parent() expressionToken: ExpressionTokenEntity): Promise<ExpressionEntity> {
    return this.expressionLoadingService.loadById(expressionToken.expressionId);
  }

  @ResolveField()
  public symbol(@Parent() expressionToken: ExpressionTokenEntity): Promise<SymbolEntity> {
    return this.symbolLoadingService.loadById(expressionToken.symbolId);
  }

  @ResolveField()
  public system(@Parent() expressionToken: ExpressionTokenEntity): Promise<SystemEntity> {
    return this.systemLoadingService.loadById(expressionToken.systemId);
  }
};
