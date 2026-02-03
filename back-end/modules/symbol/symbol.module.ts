import { SystemModule } from '@/system/system.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolController } from './controllers/symbol.controller';
import { SymbolEntity } from './entities/symbol.entity';
import { SymbolService } from './services/symbol.service';

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
    SymbolService
  ],
  exports: [
    SymbolService
  ]
})
export class SymbolModule {
};
