import { SystemModule } from '@/system/system.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolCreateService } from './services/symbol-create.service';
import { SymbolDeleteService } from './services/symbol-delete.service';
import { SymbolReadService } from './services/symbol-read.service';
import { SymbolUpdateService } from './services/symbol-update.service';
import { ValidateService } from './services/validate.service';
import { SymbolController } from './symbol.controller';
import { SymbolEntity } from './symbol.entity';

@Module({
  imports: [
    SystemModule,
    TypeOrmModule.forFeature([
      SymbolEntity
    ])
  ],
  controllers: [
    SymbolController
  ],
  providers: [
    SymbolCreateService,
    SymbolDeleteService,
    SymbolReadService,
    SymbolUpdateService,
    ValidateService
  ],
  exports: [
    SymbolReadService
  ]
})
export class SymbolModule {
};
