import { SystemModule } from '@/system/system.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolController } from './controllers/symbol.controller';
import { MongoSymbolEntity } from './entities/mongo-symbol.entity';
import { CountListener } from './listeners/count.listener';
import { SymbolRepository } from './repositories/symbol.repository';
import { SymbolResolver } from './resolvers/symbol.resolver';
import { SymbolReadService } from './services/symbol-read.service';
import { SymbolWriteService } from './services/symbol-write.service';

@Module({
  imports: [
    SystemModule,
    TypeOrmModule.forFeature([
      MongoSymbolEntity
    ]),
    UserModule
  ],
  controllers: [
    SymbolController
  ],
  providers: [
    CountListener,
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
