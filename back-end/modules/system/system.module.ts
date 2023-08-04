import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    SystemService
  ],
  exports: [
    SystemService
  ]
})
export class SystemModule {
};
