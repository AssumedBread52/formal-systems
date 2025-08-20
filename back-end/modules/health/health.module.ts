import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';
import { DatabaseCheckService } from './services/database-check.service';

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
    DatabaseCheckService
  ]
})
export class HealthModule {
};
