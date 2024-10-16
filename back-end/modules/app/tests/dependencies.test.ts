import { HttpStatus, INestApplication } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as request from 'supertest';
import { createTestApp } from './helpers/create-test-app';

describe('Dependencies', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  const cases = [
    ['dependencies', 'dependencies'],
    ['dev-dependencies', 'devDependencies']
  ];

  it.each(cases)('pulls the %s', async (type: string, key: string): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/app/${type}`);

    const { statusCode, body } = response;
    const packageJson = JSON.parse(readFileSync(process.env.npm_package_json!, 'utf-8'));

    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual(packageJson[key]);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
