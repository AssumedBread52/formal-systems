import { AuthModule } from '@/auth/auth.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserCreateService } from './services/user-create.service';
import { UserReadService } from './services/user-read.service';
import { UserUpdateService } from './services/user-update.service';
import { ValidateService } from './services/validate.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      UserEntity
    ])
  ],
  controllers: [
    UserController
  ],
  providers: [
    UserCreateService,
    UserReadService,
    UserUpdateService,
    ValidateService
  ]
})
export class UserModule {
};
