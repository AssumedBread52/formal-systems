import { AuthModule } from '@/auth/auth.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongoUserEntity } from './entities/mongo-user.entity';
import { MongoAdapter } from './services/port/adapters/mongo.adapter';
import { UserPort } from './services/port/user.port';
import { UserCreateService } from './services/user-create.service';
import { UserReadService } from './services/user-read.service';
import { UserUpdateService } from './services/user-update.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      MongoUserEntity
    ])
  ],
  controllers: [
    UserController
  ],
  providers: [
    MongoAdapter,
    UserCreateService,
    UserPort,
    UserReadService,
    UserUpdateService
  ]
})
export class UserModule {
};
