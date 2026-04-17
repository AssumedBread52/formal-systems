import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpressionTokenEntity } from './entities/expression-token.entity';
import { ExpressionEntity } from './entities/expression.entity';
import { ExpressionLoadingService } from './services/expression-loading.service';
import { ExpressionTokenLoadingService } from './services/expression-token-loading.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpressionEntity,
      ExpressionTokenEntity
    ])
  ],
  providers: [
    ExpressionLoadingService,
    ExpressionTokenLoadingService
  ],
  exports: [
    ExpressionLoadingService,
    ExpressionTokenLoadingService
  ]
})
export class ExpressionModule {
};
