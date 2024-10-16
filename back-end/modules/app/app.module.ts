import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DependenciesService } from './services/dependencies.service';

@Module({
  imports: [
    ConfigModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    DependenciesService
  ]
})
export class AppModule {
};
