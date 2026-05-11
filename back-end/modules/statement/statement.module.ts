import { ExpressionModule } from '@/expression/expression.module';
import { SystemModule } from '@/system/system.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HypothesisController } from './controllers/hypothesis.controller';
import { StatementController } from './controllers/statement.controller';
import { HypothesisEntity } from './entities/hypothesis.entity';
import { StatementEntity } from './entities/statement.entity';
import { HypothesisResolver } from './resolvers/hypothesis.resolver';
import { StatementRelationsResolver } from './resolvers/statement-relations.resolver';
import { StatementResolver } from './resolvers/statement.resolver';
import { HypothesisLoadingService } from './services/hypothesis-loading.service';
import { HypothesisReadService } from './services/hypothesis-read.service';
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
    HypothesisController,
    StatementController
  ],
  providers: [
    HypothesisLoadingService,
    HypothesisReadService,
    HypothesisResolver,
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
