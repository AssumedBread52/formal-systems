import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongoSystemEntity } from './entities/mongo-system.entity';
import { MongoAdapter } from './services/port/adapters/mongo.adapter';
import { SystemPort } from './services/port/system.port';
import { SystemCreateService } from './services/system-create.service';
import { SystemDeleteService } from './services/system-delete.service';
import { SystemReadService } from './services/system-read.service';
import { SystemUpdateService } from './services/system-update.service';
import { ValidateService } from './services/validate.service';
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
    MongoAdapter,
    SystemCreateService,
    SystemDeleteService,
    SystemPort,
    SystemReadService,
    SystemUpdateService,
    ValidateService
  ],
  exports: [
    SystemReadService
  ]
})
export class SystemModule {
};
