import { UserModule } from '@/user/user-module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth-controller';
import { AuthService } from './auth-service';
import { JwtStrategy, LocalStrategy } from './strategies';

const secret = process.env.JSON_WEB_TOKEN_SECRET;

@Module({
  imports: [
    JwtModule.register({
      secret,
      signOptions: {
        expiresIn: '60s'
      }
    }),
    PassportModule,
    UserModule
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy
  ]
})
export class AuthModule {
};
