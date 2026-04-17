import { AuthModule } from '@/auth/auth.module';
import { SystemModule } from '@/system/system.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserEntity } from './entities/user.entity';
import { UserRelationsResolver } from './resolvers/user-relations.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { UserLoadingService } from './services/user-loading.service';
import { UserReadService } from './services/user-read.service';
import { UserWriteService } from './services/user-write.service';

@Module({
  imports: [
    forwardRef((): typeof AuthModule => {
      return AuthModule;
    }),
    SystemModule,
    TypeOrmModule.forFeature([
      UserEntity
    ])
  ],
  controllers: [
    UserController
  ],
  providers: [
    UserLoadingService,
    UserReadService,
    UserRelationsResolver,
    UserResolver,
    UserWriteService
  ],
  exports: [
    UserLoadingService,
    UserReadService
  ]
})
export class UserModule {
};
