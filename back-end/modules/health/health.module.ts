import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';
import { HealthResolver } from './resolvers/health.resolver';
import { DatabaseCheckService } from './services/database-check.service';
import { IntervalCheckService } from './services/interval-check.service';

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
    DatabaseCheckService,
    HealthResolver,
    IntervalCheckService
  ]
})
export class HealthModule {
};
