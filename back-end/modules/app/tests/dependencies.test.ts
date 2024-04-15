import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/create-test-app';
import { readFileSync } from 'fs';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';

describe('Dependencies', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  const cases = [
    ['dependencies', 'dependencies'],
    ['dev-dependencies', 'devDependencies']
  ];

  it.each(cases)('succeeds %s', async (type: string, key: string): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/app/${type}`);

    const packageJson = JSON.parse(readFileSync(process.env.npm_package_json!, 'utf-8'));

    expectCorrectResponse(response, HttpStatus.OK, packageJson[key]);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
