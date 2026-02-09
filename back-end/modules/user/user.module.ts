import { AuthModule } from '@/auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { MongoUserEntity } from './entities/mongo-user.entity';
import { CountListener } from './listeners/count.listener';
import { UserRepository } from './repositories/user.repository';
import { UserResolver } from './resolvers/user.resolver';
import { UserReadService } from './services/user-read.service';
import { UserWriteService } from './services/user-write.service';

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
    UserReadService,
    UserRepository,
    UserResolver,
    UserWriteService
  ],
  exports: [
    UserReadService
  ]
})
export class UserModule {
};
