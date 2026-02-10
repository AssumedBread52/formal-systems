import { SymbolModule } from '@/symbol/symbol.module';
import { SystemModule } from '@/system/system.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementController } from './controllers/statement.controller';
import { StatementEntity } from './entities/statement.entity';
import { StatementCreateService } from './services/statement-create.service';
import { StatementDeleteService } from './services/statement-delete.service';
import { StatementReadService } from './services/statement-read.service';
import { StatementUpdateService } from './services/statement-update.service';
import { ValidateService } from './services/validate.service';

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
    StatementUpdateService,
    ValidateService
  ],
  exports: [
    StatementReadService
  ]
})
export class StatementModule {
};
