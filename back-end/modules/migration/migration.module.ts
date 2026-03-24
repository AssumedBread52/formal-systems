import { Module } from '@nestjs/common';
import { RunnerService } from './services/runner.service';

@Module({
  providers: [
    RunnerService
  ]
})
export class MigrationModule {
};
