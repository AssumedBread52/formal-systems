import { DependencyType } from '@/dependency/enums/dependency-type.enum';
import { DependencyPayload } from '@/dependency/payloads/dependency.payload';
import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';

@Injectable()
export class LibraryService {
  private static readonly FILE_NAME = 'package-lock.json';
  private static readonly BUFFER_ENCODING = 'utf-8';
  private static readonly PACKAGES_KEY = 'packages';
  private static readonly ROOT_PACKAGES_KEY = '';
  private static readonly OPERATIONAL_PACKAGES_KEY = 'dependencies';
  private static readonly DEVELOPMENT_PACKAGES_KEY = 'devDependencies';
  private static readonly PACKAGE_INDEX_PREFIX = 'node_modules/';
  private static readonly VERSION_KEY = 'version';

  public async getDependencies(): Promise<DependencyPayload[]> {
    try {
      const filePath = join(cwd(), LibraryService.FILE_NAME);

      const fileData = await readFile(filePath, LibraryService.BUFFER_ENCODING);

      const parsedData = JSON.parse(fileData);

      const packages = parsedData[LibraryService.PACKAGES_KEY];
      if (!packages) {
        throw new Error('Missing packages');
      }

      const rootPackages = packages[LibraryService.ROOT_PACKAGES_KEY];
      if (!rootPackages) {
        throw new Error('Missing root packages');
      }

      const dependencies = [];
      for (const type of [LibraryService.OPERATIONAL_PACKAGES_KEY, LibraryService.DEVELOPMENT_PACKAGES_KEY]) {
        for (const key in rootPackages[type]) {
          const packageDetails = packages[`${LibraryService.PACKAGE_INDEX_PREFIX}${key}`];
          if (!packageDetails) {
            throw new Error('Missing package details');
          }

          const version = packageDetails[LibraryService.VERSION_KEY];
          if (!version) {
            throw new Error('Missing package version data');
          }

          switch (type) {
            case LibraryService.OPERATIONAL_PACKAGES_KEY:
              dependencies.push(new DependencyPayload(key, version, DependencyType.operational));
              break;
            case LibraryService.DEVELOPMENT_PACKAGES_KEY:
              dependencies.push(new DependencyPayload(key, version, DependencyType.development));
          }
        }
      }

      return dependencies;
    } catch {
      throw new Error('Failed to get library dependency data');
    }
  }
};
