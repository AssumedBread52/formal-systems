import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CookieService } from './services/cookie.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [
        ConfigModule
      ],
      inject: [
        ConfigService
      ],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.getOrThrow<string>('JSON_WEB_TOKEN_SECRET');
        const expiresIn = configService.getOrThrow<string>('JSON_WEB_TOKEN_EXPIRES_IN');

        return {
          secret,
          signOptions: {
            expiresIn
          }
        };
      }
    }),
    UserModule
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
    CookieService,
    JwtStrategy,
    LocalStrategy,
    TokenService
  ]
})
export class AuthModule {
};
