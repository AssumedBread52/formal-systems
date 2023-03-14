import { AppModule } from '@/app/app-module';
import { AuthModule } from '@/auth/auth-module';
import { UserModule } from '@/user/user-module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

const scheme = process.env.MONGO_SCHEME;
const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const hostname = process.env.MONGO_HOSTNAME;

@Module({
  imports: [
    AppModule,
    AuthModule,
    MongooseModule.forRoot(`${scheme}://${username}:${password}@${hostname}/formal-systems?authSource=admin`),
    UserModule
  ]
})
export class MainModule {
};
