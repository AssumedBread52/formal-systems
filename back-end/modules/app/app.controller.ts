import { Controller, Get } from '@nestjs/common';
import { DependenciesService } from './services/dependencies.service';

@Controller('app')
export class AppController {
  constructor(private dependenciesService: DependenciesService) {
  }

  @Get('dependencies')
  getDependencies(): Record<string, string> {
    return this.dependenciesService.getByType('dependencies');
  }

  @Get('dev-dependencies')
  getDevDependencies(): Record<string, string> {
    return this.dependenciesService.getByType('devDependencies');
  }
};
