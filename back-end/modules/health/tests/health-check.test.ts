import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Health Check', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('succeeds', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/health');

    expectCorrectResponse(response, HttpStatus.OK, {
      details: {
        database: {
          status: 'up'
        }
      },
      error: {},
      info: {
        database: {
          status: 'up'
        }
      },
      status: 'ok'
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
