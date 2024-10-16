import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';

@Injectable()
export class DependenciesService {
  constructor(private configService: ConfigService) {
  }

  getByType(type: 'dependencies' | 'devDependencies'): Record<string, string> {
    const { [type]: value } = JSON.parse(readFileSync(this.configService.getOrThrow<string>('npm_package_json'), 'utf-8'));

    return value;
  }
};
