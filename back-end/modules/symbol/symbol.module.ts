import { SystemEntity } from '@/system/system.entity';
import { SystemModule } from '@/system/system.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolController } from './symbol.controller';
import { SymbolEntity } from './symbol.entity';
import { SymbolService } from './symbol.service';

@Module({
  imports: [
    SystemModule,
    TypeOrmModule.forFeature([
      SymbolEntity,
      SystemEntity
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
