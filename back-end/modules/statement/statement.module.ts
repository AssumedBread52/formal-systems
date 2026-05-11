import { ExpressionModule } from '@/expression/expression.module';
import { SystemModule } from '@/system/system.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementController } from './controllers/statement.controller';
import { HypothesisEntity } from './entities/hypothesis.entity';
import { StatementEntity } from './entities/statement.entity';
import { StatementRelationsResolver } from './resolvers/statement-relations.resolver';
import { StatementResolver } from './resolvers/statement.resolver';
import { HypothesisLoadingService } from './services/hypothesis-loading.service';
import { StatementLoadingService } from './services/statement-loading.service';
import { StatementReadService } from './services/statement-read.service';

@Module({
  imports: [
    forwardRef((): typeof ExpressionModule => {
      return ExpressionModule;
    }),
    forwardRef((): typeof SystemModule => {
      return SystemModule;
    }),
    TypeOrmModule.forFeature([
      HypothesisEntity,
      StatementEntity
    ])
  ],
  controllers: [
    StatementController
  ],
  providers: [
    HypothesisLoadingService,
    StatementLoadingService,
    StatementReadService,
    StatementRelationsResolver,
    StatementResolver
  ],
  exports: [
    HypothesisLoadingService,
    StatementLoadingService
  ]
})
export class StatementModule {
};
