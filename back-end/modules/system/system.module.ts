import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController } from './controllers/system.controller';
import { MongoSystemEntity } from './entities/mongo-system.entity';
import { SystemResolver } from './resolvers/system.resolver';
import { SystemReadService } from './services/system-read.service';
import { SystemWriteService } from './services/system-write.service';
import { SystemsByOwnerService } from './services/systems-by-owner.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MongoSystemEntity
    ]),
    UserModule
  ],
  controllers: [
    SystemController
  ],
  providers: [
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
