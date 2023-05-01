import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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
    ])
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService
  ]
})
export class AuthModule {
};
