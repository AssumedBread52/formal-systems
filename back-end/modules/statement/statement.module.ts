import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementEntity } from './statement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StatementEntity
    ])
  ]
})
export class StatementModule {
};
