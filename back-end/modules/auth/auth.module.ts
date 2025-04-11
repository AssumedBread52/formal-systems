import { UserModule } from '@/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { CookieService } from './services/cookie.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    forwardRef((): typeof UserModule => {
      return UserModule;
    }),
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
    })
  ],
  controllers: [
    AuthController
  ],
  providers: [
    CookieService,
    JwtStrategy,
    LocalStrategy,
    TokenService
  ],
  exports: [
    CookieService,
    TokenService
  ]
})
export class AuthModule {
};
