import { SystemModule } from '@/system/system.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CleanUpSubscriber } from './subscribers/clean-up.subscriber';
import { SymbolController } from './symbol.controller';
import { SymbolEntity } from './symbol.entity';
import { SymbolService } from './symbol.service';

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
    CleanUpSubscriber,
    SymbolService
  ]
})
export class SymbolModule {
};
