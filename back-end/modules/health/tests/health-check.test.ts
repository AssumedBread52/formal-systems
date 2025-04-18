import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { pingCheckMock } from './mocks/ping-check.mock';

describe('Health Check', (): void => {
  const getOrThrow = getOrThrowMock();
  const pingCheck = pingCheckMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('passes a health check', async (): Promise<void> => {
    pingCheck.mockResolvedValueOnce({
      database: {
        status: 'up'
      }
    });

    const response = await request(app.getHttpServer()).get('/health');

    const { statusCode, body } = response;

    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
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

  it('fails a health check', async (): Promise<void> => {
    pingCheck.mockResolvedValueOnce({
      database: {
        message: 'Returned error message',
        status: 'down'
      }
    });

    const response = await request(app.getHttpServer()).get('/health');

    const { statusCode, body } = response;

    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
    expect(statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(body).toEqual({
      details: {
        database: {
          message: 'Returned error message',
          status: 'down'
        }
      },
      error: {
        database: {
          message: 'Returned error message',
          status: 'down'
        }
      },
      info: {},
      status: 'error'
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
