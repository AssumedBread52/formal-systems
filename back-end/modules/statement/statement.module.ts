import { ExpressionModule } from '@/expression/expression.module';
import { SystemModule } from '@/system/system.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistinctVariablePairController } from './controllers/distinct-variable-pair.controller';
import { HypothesisController } from './controllers/hypothesis.controller';
import { StatementController } from './controllers/statement.controller';
import { DistinctVariablePairEntity } from './entities/distinct-variable-pair.entity';
import { HypothesisEntity } from './entities/hypothesis.entity';
import { StatementEntity } from './entities/statement.entity';
import { DistinctVariablePairResolver } from './resolvers/distinct-variable-pair.resolver';
import { HypothesisRelationsResolver } from './resolvers/hypothesis-relations.resolver';
import { HypothesisResolver } from './resolvers/hypothesis.resolver';
import { StatementRelationsResolver } from './resolvers/statement-relations.resolver';
import { StatementResolver } from './resolvers/statement.resolver';
import { DistinctVariablePairLoadingService } from './services/distinct-variable-pair-loading.service';
import { DistinctVariablePairReadService } from './services/distinct-variable-pair-read.service';
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
      DistinctVariablePairEntity,
      HypothesisEntity,
      StatementEntity
    ])
  ],
  controllers: [
    DistinctVariablePairController,
    HypothesisController,
    StatementController
  ],
  providers: [
    DistinctVariablePairLoadingService,
    DistinctVariablePairReadService,
    DistinctVariablePairResolver,
    HypothesisLoadingService,
    HypothesisReadService,
    HypothesisRelationsResolver,
    HypothesisResolver,
    StatementLoadingService,
    StatementReadService,
    StatementRelationsResolver,
    StatementResolver
  ],
  exports: [
    DistinctVariablePairLoadingService,
    HypothesisLoadingService,
    StatementLoadingService
  ]
})
export class StatementModule {
};
