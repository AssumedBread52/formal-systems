import { SystemModule } from '@/system/system.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolController } from './controllers/symbol.controller';
import { MongoSymbolEntity } from './entities/mongo-symbol.entity';
import { SymbolRepository } from './repositories/symbol.repository';
import { SymbolService } from './services/symbol.service';

@Module({
  imports: [
    SystemModule,
    TypeOrmModule.forFeature([
      MongoSymbolEntity
    ])
  ],
  controllers: [
    SymbolController
  ],
  providers: [
    SymbolRepository,
    SymbolService
  ],
  exports: [
    SymbolService
  ]
})
export class SymbolModule {
};
