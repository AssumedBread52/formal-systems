import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';

@Controller('app')
export class AppController {
  private packageJson: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };

  constructor(configService: ConfigService) {
    this.packageJson = JSON.parse(readFileSync(configService.getOrThrow<string>('npm_package_json'), 'utf-8'));
  }

  @Get('status')
  @HttpCode(HttpStatus.NO_CONTENT)
  getStatus(): void {
  }

  @Get('dependencies')
  getDependencies(): Record<string, string> {
    const { dependencies } = this.packageJson;

    return dependencies;
  }

  @Get('dev-dependencies')
  getDevDependencies(): Record<string, string> {
    const { devDependencies } = this.packageJson;

    return devDependencies;
  }
};
