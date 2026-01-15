import { AuthModule } from '@/auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongoUserEntity } from './entities/mongo-user.entity';
import { SystemCountListener } from './listeners/system-count.listener';
import { UserCreateService } from './services/user-create.service';
import { UserReadService } from './services/user-read.service';
import { UserUpdateService } from './services/user-update.service';
import { UserController } from './controllers/user.controller';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [
    forwardRef((): typeof AuthModule => {
      return AuthModule;
    }),
    TypeOrmModule.forFeature([
      MongoUserEntity
    ])
  ],
  controllers: [
    UserController
  ],
  providers: [
    UserRepository,
    SystemCountListener,
    UserCreateService,
    UserReadService,
    UserUpdateService
  ],
  exports: [
    UserReadService
  ]
})
export class UserModule {
};
