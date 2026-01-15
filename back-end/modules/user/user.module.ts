import { AuthModule } from '@/auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { MongoUserEntity } from './entities/mongo-user.entity';
import { SystemCountListener } from './listeners/system-count.listener';
import { UserRepository } from './repositories/user.repository';
import { UserReadService } from './services/user-read.service';
import { UserUpdateService } from './services/user-update.service';

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
    SystemCountListener,
    UserReadService,
    UserRepository,
    UserUpdateService
  ],
  exports: [
    UserReadService
  ]
})
export class UserModule {
};
