import { DependenciesNotFoundException } from '@/dependency/exceptions/dependencies-not-found.exception';
import { DependencyPayload } from '@/dependency/payloads/dependency.payload';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { LibraryService } from './library.service';

@Injectable()
export class DependencyService {
  public constructor(private readonly libraryService: LibraryService) {
  }

  public async getApplicationDependencies(): Promise<DependencyPayload[]> {
    try {
      const libraryDependencies = await this.libraryService.getDependencies();

      if (0 === libraryDependencies.length) {
        throw new DependenciesNotFoundException();
      }

      return libraryDependencies;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading application dependencies failed');
    }
  }
};
