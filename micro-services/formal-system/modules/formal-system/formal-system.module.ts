import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormalSystemController } from './formal-system.controller';
import { FormalSystem, FormalSystemSchema } from './formal-system.schema';
import { FormalSystemService } from './formal-system.service';
import { JwtStrategy } from './strategies';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormalSystem.name, schema: FormalSystemSchema }
    ])
  ],
  controllers: [
    FormalSystemController
  ],
  providers: [
    FormalSystemService,
    JwtStrategy
  ]
})
export class FormalSystemModule {
};
