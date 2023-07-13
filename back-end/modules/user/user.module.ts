import { SystemModule } from '@/system/system.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemCountSubscriber } from './subscribers/system-count.subscriber';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    SystemModule,
    TypeOrmModule.forFeature([
      UserEntity
    ])
  ],
  controllers: [
    UserController
  ],
  providers: [
    SystemCountSubscriber,
    UserService
  ],
  exports: [
    UserService
  ]
})
export class UserModule {
};
