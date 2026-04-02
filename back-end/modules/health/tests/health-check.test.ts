import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { accessMock } from '@/common/tests/mocks/access.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { pingCheckMock } from '@/common/tests/mocks/ping-check.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { constants } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';
import request from 'supertest';

describe('Health Check', (): void => {
  const access = accessMock();
  const getOrThrow = getOrThrowMock();
  const pingCheck = pingCheckMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /health', async (): Promise<void> => {
    access.mockResolvedValueOnce();
    pingCheck.mockResolvedValueOnce({
      database: {
        status: 'up'
      }
    });

    const response = await request(app.getHttpServer()).get('/health');

    expect(access).toHaveBeenCalledTimes(1);
    expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
    expect(response.body).toStrictEqual({
      componentStatusPayloads: [
        {
          componentType: 'database',
          healthStatus: 'up'
        },
        {
          componentType: 'file',
          healthStatus: 'up'
        }
      ],
      healthStatus: 'up'
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql query healthCheck', async (): Promise<void> => {
    access.mockResolvedValueOnce();
    pingCheck.mockResolvedValueOnce({
      database: {
        status: 'up'
      }
    });

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
    });

    expect(access).toHaveBeenCalledTimes(1);
    expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
    expect(response.body).toStrictEqual({
      data: {
        healthCheck: {
          componentStatusPayloads: [
            {
              componentType: 'database',
              healthStatus: 'up'
            },
            {
              componentType: 'file',
              healthStatus: 'up'
            }
          ],
          healthStatus: 'up'
        }
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
