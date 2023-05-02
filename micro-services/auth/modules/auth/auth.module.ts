import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MESSAGING_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOSTNAME,
          port: 6379,
          password: process.env.REDIS_PASSWORD
        }
      }
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JSON_WEB_TOKEN_SECRET,
      signOptions: {
        expiresIn: '60s'
      }
    })
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
    LocalStrategy
  ]
})
export class AuthModule {
};
