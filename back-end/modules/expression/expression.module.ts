import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpressionEntity } from './entities/expression.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpressionEntity
    ])
  ]
})
export class ExpressionModule {
};
