import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/create-test-app';

describe('Status Check', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('succeeds', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/app/status');

    expectCorrectResponse(response, HttpStatus.NO_CONTENT, {});
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
