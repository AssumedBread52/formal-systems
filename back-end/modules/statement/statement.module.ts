import { SymbolModule } from '@/symbol/symbol.module';
import { SystemEntity } from '@/system/system.entity';
import { SystemModule } from '@/system/system.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementCreateService } from './services/statement-create.service';
import { StatementController } from './statement.controller';
import { StatementEntity } from './statement.entity';
import { StatementService } from './statement.service';

@Module({
  imports: [
    SymbolModule,
    SystemModule,
    TypeOrmModule.forFeature([
      StatementEntity,
      SystemEntity
    ])
  ],
  controllers: [
    StatementController
  ],
  providers: [
    StatementCreateService,
    StatementService
  ]
})
export class StatementModule {
};
