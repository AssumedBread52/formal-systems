import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongoSystemEntity } from './entities/mongo-system.entity';
import { SystemRepository } from './repositories/system.repository';
import { SystemService } from './services/system.service';
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
    SystemRepository,
    SystemService
  ],
  exports: [
    SystemRepository
  ]
})
export class SystemModule {
};
