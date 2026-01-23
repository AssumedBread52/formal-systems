import { AuthModule } from '@/auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { MongoUserEntity } from './entities/mongo-user.entity';
import { CountListener } from './listeners/count.listener';
import { UserRepository } from './repositories/user.repository';
import { UserResolver } from './resolvers/user.resolver';
import { UserService } from './services/user.service';

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
    CountListener,
    UserRepository,
    UserResolver,
    UserService
  ],
  exports: [
    UserRepository
  ]
})
export class UserModule {
};
