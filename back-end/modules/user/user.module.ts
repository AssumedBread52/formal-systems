import { AuthModule } from '@/auth/auth.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

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
    UserService
  ]
})
export class UserModule {
};
