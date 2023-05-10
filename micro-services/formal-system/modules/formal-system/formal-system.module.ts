import { Module } from '@nestjs/common';
import { FormalSystemController } from './formal-system.controller';

@Module({
  controllers: [
    FormalSystemController
  ]
})
export class FormalSystemModule {
};
