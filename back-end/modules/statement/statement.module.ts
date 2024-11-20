import { SymbolModule } from '@/symbol/symbol.module';
import { SystemModule } from '@/system/system.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementCreateService } from './services/statement-create.service';
import { StatementDeleteService } from './services/statement-delete.service';
import { StatementReadService } from './services/statement-read.service';
import { ValidateService } from './services/validate.service';
import { StatementController } from './statement.controller';
import { StatementEntity } from './statement.entity';
import { StatementService } from './statement.service';

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
    StatementCreateService,
    StatementDeleteService,
    StatementReadService,
    StatementService,
    ValidateService
  ]
})
export class StatementModule {
};
