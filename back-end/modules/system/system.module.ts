import { SymbolModule } from '@/symbol/symbol.module';
import { UserModule } from '@/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController } from './controllers/system.controller';
import { SystemEntity } from './entities/system.entity';
import { RelationsResolver } from './resolvers/relations.resolver';
import { SystemResolver } from './resolvers/system.resolver';
import { SystemLoadingService } from './services/system-loading.service';
import { SystemReadService } from './services/system-read.service';
import { SystemWriteService } from './services/system-write.service';

@Module({
  imports: [
    forwardRef((): typeof UserModule => {
      return UserModule;
    }),
    SymbolModule,
    TypeOrmModule.forFeature([
      SystemEntity
    ])
  ],
  controllers: [
    SystemController
  ],
  providers: [
    RelationsResolver,
    SystemLoadingService,
    SystemReadService,
    SystemResolver,
    SystemWriteService
  ],
  exports: [
    SystemLoadingService,
    SystemReadService
  ]
})
export class SystemModule {
};
