import { SystemModule } from '@/system/system.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolController } from './controllers/symbol.controller';
import { MongoSymbolEntity } from './entities/mongo-symbol.entity';
import { SymbolRepository } from './repositories/symbol.repository';
import { SymbolResolver } from './resolvers/symbol.resolver';
import { SymbolReadService } from './services/symbol-read.service';
import { SymbolWriteService } from './services/symbol-write.service';

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
    SymbolReadService,
    SymbolRepository,
    SymbolResolver,
    SymbolWriteService
  ],
  exports: [
    SymbolReadService
  ]
})
export class SymbolModule {
};
