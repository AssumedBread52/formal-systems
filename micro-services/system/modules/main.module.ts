import { AppModule } from '@/app/app.module';
import { SystemModule } from '@/system/system.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

const scheme = process.env.MONGO_SCHEME;
const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const hostname = process.env.MONGO_HOSTNAME;

const encodedPassword = encodeURIComponent(password ?? '');

@Module({
  imports: [
    AppModule,
    MongooseModule.forRoot(`${scheme}://${username}:${encodedPassword}@${hostname}/formal-systems?authSource=admin`),
    SystemModule
  ]
})
export class MainModule {
};
