import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { readFileSync } from 'fs';

@Controller('app')
export class AppController {
  private packageJson = JSON.parse(readFileSync(process.env.npm_package_json, 'utf-8'));

  @Get('status')
  @HttpCode(HttpStatus.NO_CONTENT)
  getStatus(): void {
  }

  @Get('dependencies')
  getDependencies(): Record<string, string> {
    return this.packageJson.dependencies;
  }

  @Get('dev-dependencies')
  getDevDependencies(): Record<string, string> {
    return this.packageJson.devDependencies;
  }
};
