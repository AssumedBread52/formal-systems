import { AuthModule } from '@/auth/auth.module';
import { SystemModule } from '@/system/system.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserEntity } from './entities/user.entity';
import { RelationsResolver } from './resolvers/relations.resolver';
import { UserResolver } from './resolvers/user.resolver';
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
    RelationsResolver,
    UserReadService,
    UserResolver,
    UserWriteService
  ],
  exports: [
    UserReadService
  ]
})
export class UserModule {
};
