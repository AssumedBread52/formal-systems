import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { constants } from 'fs/promises';
import * as request from 'supertest';
import { accessMock } from './mocks/access.mock';
import { pingCheckMock } from './mocks/ping-check.mock';

describe('Health Check', (): void => {
  const access = accessMock();
  const getOrThrow = getOrThrowMock();
  const pingCheck = pingCheckMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /health (database check pass, file check pass)', async (): Promise<void> => {
    const filePath = '/path/to/file.json';

    access.mockResolvedValueOnce();
    getOrThrow.mockReturnValueOnce(filePath);
    pingCheck.mockResolvedValueOnce({
      database: {
        status: 'up'
      }
    });

    const response = await request(app.getHttpServer()).get('/health');

    const { statusCode, body } = response;

    expect(access).toHaveBeenCalledTimes(1);
    expect(access).toHaveBeenNthCalledWith(1, filePath, constants.R_OK);
    expect(getOrThrow).toHaveBeenCalledTimes(1);
    expect(getOrThrow).toHaveBeenNthCalledWith(1, 'npm_package_json');
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
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
  });

  it('POST /graphql query healthCheck (database check pass, file check pass)', async (): Promise<void> => {
    const filePath = '/path/to/file.json';

    access.mockResolvedValueOnce();
    getOrThrow.mockReturnValueOnce(filePath);
    pingCheck.mockResolvedValueOnce({
      database: {
        status: 'up'
      }
    });

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
    });

    const { statusCode, body } = response;

    expect(access).toHaveBeenCalledTimes(1);
    expect(access).toHaveBeenNthCalledWith(1, filePath, constants.R_OK);
    expect(getOrThrow).toHaveBeenCalledTimes(1);
    expect(getOrThrow).toHaveBeenNthCalledWith(1, 'npm_package_json');
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
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
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
