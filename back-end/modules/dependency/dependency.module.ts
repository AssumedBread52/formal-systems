import { Module } from '@nestjs/common';
import { DependencyController } from './controllers/dependency.controller';
import { DependencyResolver } from './resolvers/dependency.resolver';
import { DependencyService } from './services/dependency.service';
import { LibraryService } from './services/library.service';

@Module({
  controllers: [
    DependencyController
  ],
  providers: [
    DependencyResolver,
    DependencyService,
    LibraryService
  ]
})
export class DependencyModule {
};
