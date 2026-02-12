import { SymbolModule } from '@/symbol/symbol.module';
import { SystemModule } from '@/system/system.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementController } from './controllers/statement.controller';
import { MongoStatementEntity } from './entities/mongo-statement.entity';

@Module({
  imports: [
    SymbolModule,
    SystemModule,
    TypeOrmModule.forFeature([
      MongoStatementEntity
    ])
  ],
  controllers: [
    StatementController
  ],
  providers: [
    StatementController
  ],
  exports: [
    StatementController
  ]
})
export class StatementModule {
};
