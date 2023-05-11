import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemController } from './system.controller';
import { System, SystemSchema } from './system.schema';
import { SystemService } from './system.service';
import { JwtStrategy } from './strategies';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: System.name, schema: SystemSchema }
    ])
  ],
  controllers: [
    SystemController
  ],
  providers: [
    JwtStrategy,
    SystemService
  ]
})
export class SystemModule {
};
