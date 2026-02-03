import { DependencyPayload } from '@/dependency/payloads/dependency.payload';
import { DependencyService } from '@/dependency/services/dependency.service';
import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class DependencyResolver {
  public constructor(private readonly dependencyService: DependencyService) {
  }

  @Query((): [typeof DependencyPayload] => {
    return [DependencyPayload];
  })
  public dependencies(): Promise<DependencyPayload[]> {
    return this.dependencyService.getApplicationDependencies();
  }
};
