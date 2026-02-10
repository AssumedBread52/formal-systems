import { SymbolModule } from '@/symbol/symbol.module';
import { SystemModule } from '@/system/system.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementController } from './controllers/statement.controller';
import { StatementEntity } from './entities/statement.entity';

@Module({
  imports: [
    SymbolModule,
    SystemModule,
    TypeOrmModule.forFeature([
      StatementEntity
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
