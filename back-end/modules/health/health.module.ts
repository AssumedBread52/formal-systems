import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';
import { HealthResolver } from './resolvers/health.resolver';
import { DatabaseCheckService } from './services/database-check.service';
import { FileCheckService } from './services/file-check.service';
import { IntervalCheckService } from './services/interval-check.service';

@Module({
  imports: [
    ConfigModule,
    TerminusModule.forRoot({
      errorLogStyle: 'pretty'
    })
  ],
  controllers: [
    HealthController
  ],
  providers: [
    DatabaseCheckService,
    FileCheckService,
    HealthResolver,
    IntervalCheckService
  ]
})
export class HealthModule {
};
