import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController } from './controllers/system.controller';
import { MongoSystemEntity } from './entities/mongo-system.entity';
import { CountListener } from './listeners/count.listener';
import { SystemRepository } from './repositories/system.repository';
import { SystemResolver } from './resolvers/system.resolver';
import { SystemService } from './services/system.service';

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
    CountListener,
    SystemRepository,
    SystemResolver,
    SystemService
  ],
  exports: [
    SystemRepository
  ]
})
export class SystemModule {
};
