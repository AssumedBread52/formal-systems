import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { HealthCheckError } from '@nestjs/terminus';
import * as request from 'supertest';
import { pingCheckMock } from './mocks/ping-check.mock';

describe('Health Check', (): void => {
  const getOrThrow = getOrThrowMock();
  const pingCheck = pingCheckMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('performs a successful health check', async (): Promise<void> => {
    pingCheck.mockResolvedValueOnce({
      database: {
        status: 'up'
      }
    });

    const response = await request(app.getHttpServer()).get('/health');

    const { statusCode, body } = response;

    expect(getOrThrow).toHaveBeenCalledTimes(0);
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

  it('fails a health check', async (): Promise<void> => {
    pingCheck.mockRejectedValueOnce(new HealthCheckError('Ignored Error message', {
      database: {
        message: 'Returned error message',
        status: 'down'
      }
    }));

    const response = await request(app.getHttpServer()).get('/health');

    const { statusCode, body } = response;

    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenCalledWith('database');
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
