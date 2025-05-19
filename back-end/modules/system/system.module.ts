import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongoSystemEntity } from './entities/mongo-system.entity';
import { CompositeAdapterRepository } from './repositories/composite-adapter.repository';
import { MongoAdapterRepository } from './repositories/mongo-adapter.repository';
import { SystemCreateService } from './services/system-create.service';
import { SystemDeleteService } from './services/system-delete.service';
import { SystemReadService } from './services/system-read.service';
import { SystemUpdateService } from './services/system-update.service';
import { SystemController } from './system.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MongoSystemEntity
    ])
  ],
  controllers: [
    SystemController
  ],
  providers: [
    CompositeAdapterRepository,
    MongoAdapterRepository,
    SystemCreateService,
    SystemDeleteService,
    SystemReadService,
    SystemUpdateService
  ],
  exports: [
    SystemReadService
  ]
})
export class SystemModule {
};
