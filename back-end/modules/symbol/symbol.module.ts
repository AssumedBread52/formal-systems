import { SystemModule } from '@/system/system.module';
import { UserModule } from '@/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolController } from './controllers/symbol.controller';
import { SymbolEntity } from './entities/symbol.entity';
import { RelationsResolver } from './resolvers/relations.resolver';
import { SymbolResolver } from './resolvers/symbol.resolver';
import { SymbolLoadingService } from './services/symbol-loading.service';
import { SymbolReadService } from './services/symbol-read.service';
import { SymbolWriteService } from './services/symbol-write.service';

@Module({
  imports: [
    forwardRef((): typeof SystemModule => {
      return SystemModule;
    }),
    forwardRef((): typeof UserModule => {
      return UserModule;
    }),
    TypeOrmModule.forFeature([
      SymbolEntity
    ])
  ],
  controllers: [
    SymbolController
  ],
  providers: [
    RelationsResolver,
    SymbolLoadingService,
    SymbolReadService,
    SymbolResolver,
    SymbolWriteService
  ],
  exports: [
    SymbolLoadingService
  ]
})
export class SymbolModule {
};
