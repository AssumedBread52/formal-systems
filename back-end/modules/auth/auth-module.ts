import { UserModule } from '@/user/user-module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth-service';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt-strategy';
import { LocalStrategy } from './local-strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: '60s'
      }
    }),
    PassportModule,
    UserModule
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy
  ]
})
export class AuthModule {
};
