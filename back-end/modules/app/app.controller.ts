import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';

@Controller('app')
export class AppController {
  constructor(private configService: ConfigService) {
  }

  @Get('dependencies')
  getDependencies(): Record<string, string> {
    const { dependencies } = JSON.parse(readFileSync(this.configService.getOrThrow<string>('npm_package_json'), 'utf-8'));

    return dependencies;
  }

  @Get('dev-dependencies')
  getDevDependencies(): Record<string, string> {
    const { devDependencies } = JSON.parse(readFileSync(this.configService.getOrThrow<string>('npm_package_json'), 'utf-8'));

    return devDependencies;
  }
};
