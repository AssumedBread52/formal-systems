import { DependencyPayload } from '@/dependency/payloads/dependency.payload';
import { DependencyService } from '@/dependency/services/dependency.service';
import { Controller, Get } from '@nestjs/common';

@Controller('dependency')
export class DependencyController {
  public constructor(private readonly dependencyService: DependencyService) {
  }

  @Get()
  public getDependencies(): Promise<DependencyPayload[]> {
    return this.dependencyService.getApplicationDependencies();
  }
};
