import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { pingCheckMock } from './mocks/ping-check.mock';

describe('Health Check', (): void => {
  const pingCheck = pingCheckMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('performs a health check', async (): Promise<void> => {
    pingCheck.mockResolvedValueOnce({
      database: {
        status: 'up'
      }
    });

    const response = await request(app.getHttpServer()).get('/health');

    const { statusCode, body } = response;

    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenCalledWith('database');
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
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
