import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementController } from './statement.controller';
import { StatementEntity } from './statement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StatementEntity
    ])
  ],
  controllers: [
    StatementController
  ]
})
export class StatementModule {
};
