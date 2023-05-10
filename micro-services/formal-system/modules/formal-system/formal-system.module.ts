import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormalSystemController } from './formal-system.controller';
import { FormalSystem, FormalSystemSchema } from './formal-system.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormalSystem.name, schema: FormalSystemSchema }
    ])
  ],
  controllers: [
    FormalSystemController
  ]
})
export class FormalSystemModule {
};
