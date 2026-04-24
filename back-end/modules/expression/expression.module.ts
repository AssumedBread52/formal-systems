import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpressionController } from './controllers/expression.controller';
import { ExpressionTokenEntity } from './entities/expression-token.entity';
import { ExpressionEntity } from './entities/expression.entity';
import { ExpressionResolver } from './resolvers/expression.resolver';
import { ExpressionLoadingService } from './services/expression-loading.service';
import { ExpressionReadService } from './services/expression-read.service';
import { ExpressionTokenLoadingService } from './services/expression-token-loading.service';

@Module({
  imports: [
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
    ExpressionResolver,
    ExpressionTokenLoadingService
  ],
  exports: [
    ExpressionLoadingService,
    ExpressionTokenLoadingService
  ]
})
export class ExpressionModule {
};
