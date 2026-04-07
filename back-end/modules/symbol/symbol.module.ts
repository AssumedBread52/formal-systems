import { SystemModule } from '@/system/system.module';
import { UserModule } from '@/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolController } from './controllers/symbol.controller';
import { SymbolEntity } from './entities/symbol.entity';
import { RelationsResolver } from './resolvers/relations.resolver';
import { SymbolResolver } from './resolvers/symbol.resolver';
import { SymbolReadService } from './services/symbol-read.service';
import { SymbolWriteService } from './services/symbol-write.service';
import { SymbolsBySystemService } from './services/symbols-by-system.service';

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
    SymbolReadService,
    SymbolResolver,
    SymbolsBySystemService,
    SymbolWriteService
  ],
  exports: [
    SymbolsBySystemService
  ]
})
export class SymbolModule {
};
