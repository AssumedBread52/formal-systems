import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DatabaseService } from './services/database.service';

@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty'
    })
  ],
  controllers: [
    HealthController
  ],
  providers: [
    DatabaseService
  ]
})
export class HealthModule {
};
