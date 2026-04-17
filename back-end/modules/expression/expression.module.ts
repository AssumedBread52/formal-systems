import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpressionTokenEntity } from './entities/expression-token.entity';
import { ExpressionEntity } from './entities/expression.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpressionEntity,
      ExpressionTokenEntity
    ])
  ]
})
export class ExpressionModule {
};
