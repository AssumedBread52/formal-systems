import { ExpressionModule } from '@/expression/expression.module';
import { SystemModule } from '@/system/system.module';
import { UserModule } from '@/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolController } from './controllers/symbol.controller';
import { SymbolEntity } from './entities/symbol.entity';
import { SymbolRelationsResolver } from './resolvers/symbol-relations.resolver';
import { SymbolResolver } from './resolvers/symbol.resolver';
import { SymbolLoadingService } from './services/symbol-loading.service';
import { SymbolReadService } from './services/symbol-read.service';
import { SymbolWriteService } from './services/symbol-write.service';

@Module({
  imports: [
    forwardRef((): typeof ExpressionModule => {
      return ExpressionModule;
    }),
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
    SymbolLoadingService,
    SymbolReadService,
    SymbolRelationsResolver,
    SymbolResolver,
    SymbolWriteService
  ],
  exports: [
    SymbolLoadingService,
    SymbolReadService
  ]
})
export class SymbolModule {
};
