import { UserModule } from '@/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController } from './controllers/system.controller';
import { SystemEntity } from './entities/system.entity';
import { RelationsResolver } from './resolvers/relations.resolver';
import { SystemResolver } from './resolvers/system.resolver';
import { SystemReadService } from './services/system-read.service';
import { SystemWriteService } from './services/system-write.service';
import { SystemsByOwnerService } from './services/systems-by-owner.service';

@Module({
  imports: [
    forwardRef((): typeof UserModule => {
      return UserModule;
    }),
    TypeOrmModule.forFeature([
      SystemEntity
    ])
  ],
  controllers: [
    SystemController
  ],
  providers: [
    RelationsResolver,
    SystemReadService,
    SystemResolver,
    SystemsByOwnerService,
    SystemWriteService
  ],
  exports: [
    SystemReadService,
    SystemsByOwnerService
  ]
})
export class SystemModule {
};
