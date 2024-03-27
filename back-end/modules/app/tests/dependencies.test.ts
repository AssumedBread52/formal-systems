import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as request from 'supertest';
import { createTestApp } from './helpers/create-test-app';

describe('Dependencies', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('succeeds in returning the dependencies with their respective versions', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/app/dependencies');

    const { dependencies } = JSON.parse(readFileSync(process.env.npm_package_json!, 'utf-8'));

    expectCorrectResponse(response, HttpStatus.OK, dependencies);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
