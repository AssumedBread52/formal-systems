import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemCreateService } from './services/system-create.service';
import { SystemDeleteService } from './services/system-delete.service';
import { SystemReadService } from './services/system-read.service';
import { SystemUpdateService } from './services/system-update.service';
import { ValidateService } from './services/validate.service';
import { SystemController } from './system.controller';
import { SystemEntity } from './system.entity';
import { SystemService } from './system.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemEntity
    ])
  ],
  controllers: [
    SystemController
  ],
  providers: [
    SystemCreateService,
    SystemDeleteService,
    SystemReadService,
    SystemService,
    SystemUpdateService,
    ValidateService
  ],
  exports: [
    SystemService
  ]
})
export class SystemModule {
};
