import { SymbolModule } from '@/symbol/symbol.module';
import { SystemModule } from '@/system/system.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpressionController } from './controllers/expression.controller';
import { ExpressionTokenEntity } from './entities/expression-token.entity';
import { ExpressionEntity } from './entities/expression.entity';
import { ExpressionRelationsResolver } from './resolvers/expression-relations.resolver';
import { ExpressionTokenRelationsResolver } from './resolvers/expression-token-relations.resolver';
import { ExpressionResolver } from './resolvers/expression.resolver';
import { ExpressionLoadingService } from './services/expression-loading.service';
import { ExpressionReadService } from './services/expression-read.service';
import { ExpressionTokenLoadingService } from './services/expression-token-loading.service';

@Module({
  imports: [
    forwardRef((): typeof SystemModule => {
      return SystemModule;
    }),
    SymbolModule,
    TypeOrmModule.forFeature([
      ExpressionEntity,
      ExpressionTokenEntity
    ])
  ],
  controllers: [
    ExpressionController
  ],
  providers: [
    ExpressionLoadingService,
    ExpressionReadService,
    ExpressionRelationsResolver,
    ExpressionResolver,
    ExpressionTokenLoadingService,
    ExpressionTokenRelationsResolver
  ],
  exports: [
    ExpressionLoadingService,
    ExpressionTokenLoadingService
  ]
})
export class ExpressionModule {
};
