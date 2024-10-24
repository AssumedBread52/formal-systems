import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemDeleteService } from './services/system-delete.service';
import { SystemReadService } from './services/system-read.service';
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
    SystemDeleteService,
    SystemReadService,
    SystemService,
    ValidateService
  ],
  exports: [
    SystemService
  ]
})
export class SystemModule {
};
