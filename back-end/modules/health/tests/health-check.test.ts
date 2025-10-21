import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { constants } from 'fs/promises';
import * as request from 'supertest';
import { accessMock } from './mocks/access.mock';
import { pingCheckMock } from './mocks/ping-check.mock';

describe('Health Check', (): void => {
  const access = accessMock();
  const pingCheck = pingCheckMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /health database check pass, file check pass', async (): Promise<void> => {
    pingCheck.mockResolvedValueOnce({
      database: {
        status: 'up'
      }
    });

    const response = await request(app.getHttpServer()).get('/health');

    const { statusCode, body } = response;

    expect(access).toHaveBeenCalledTimes(1);
    expect(access).toHaveBeenNthCalledWith(1, '/app/package.json', constants.R_OK);
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
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

  it('GET /health database check fail, file check pass', async (): Promise<void> => {
    pingCheck.mockResolvedValueOnce({
      database: {
        status: 'down'
      }
    });

    const response = await request(app.getHttpServer()).get('/health');

    const { statusCode, body } = response;

    expect(access).toHaveBeenCalledTimes(1);
    expect(access).toHaveBeenNthCalledWith(1, '/app/package.json', constants.R_OK);
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
    expect(statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(body).toEqual({
      componentStatusPayloads: [
        {
          componentType: 'database',
          healthStatus: 'down'
        },
        {
          componentType: 'file',
          healthStatus: 'up'
        }
      ],
      healthStatus: 'down'
    });
  });

  it('GET /health database check pass, file check fail', async (): Promise<void> => {
    access.mockRejectedValueOnce(undefined);
    pingCheck.mockResolvedValueOnce({
      database: {
        status: 'up'
      }
    });

    const response = await request(app.getHttpServer()).get('/health');

    const { statusCode, body } = response;

    expect(access).toHaveBeenCalledTimes(1);
    expect(access).toHaveBeenNthCalledWith(1, '/app/package.json', constants.R_OK);
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
    expect(statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(body).toEqual({
      componentStatusPayloads: [
        {
          componentType: 'database',
          healthStatus: 'up'
        },
        {
          componentType: 'file',
          healthStatus: 'down'
        }
      ],
      healthStatus: 'down'
    });
  });

  it('GET /health database check fail, file check fail', async (): Promise<void> => {
    access.mockRejectedValueOnce(undefined);
    pingCheck.mockResolvedValueOnce({
      database: {
        status: 'down'
      }
    });

    const response = await request(app.getHttpServer()).get('/health');

    const { statusCode, body } = response;

    expect(access).toHaveBeenCalledTimes(1);
    expect(access).toHaveBeenNthCalledWith(1, '/app/package.json', constants.R_OK);
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
    expect(statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(body).toEqual({
      componentStatusPayloads: [
        {
          componentType: 'database',
          healthStatus: 'down'
        },
        {
          componentType: 'file',
          healthStatus: 'down'
        }
      ],
      healthStatus: 'down'
    });
  });

  it('POST /graphql query healthCheck database check pass, file check pass', async (): Promise<void> => {
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
    expect(access).toHaveBeenNthCalledWith(1, '/app/package.json', constants.R_OK);
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
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

  it('POST /graphql query healthCheck database check fail, file check pass', async (): Promise<void> => {
    pingCheck.mockResolvedValueOnce({
      database: {
        status: 'down'
      }
    });

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
    });

    const { statusCode, body } = response;

    expect(access).toHaveBeenCalledTimes(1);
    expect(access).toHaveBeenNthCalledWith(1, '/app/package.json', constants.R_OK);
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
      data: {
        healthCheck: {
          componentStatusPayloads: [
            {
              componentType: 'database',
              healthStatus: 'down'
            },
            {
              componentType: 'file',
              healthStatus: 'up'
            }
          ],
          healthStatus: 'down'
        }
      }
    });
  });

  it('POST /graphql query healthCheck database check pass, file check fail', async (): Promise<void> => {
    access.mockRejectedValueOnce(undefined);
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
    expect(access).toHaveBeenNthCalledWith(1, '/app/package.json', constants.R_OK);
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
      data: {
        healthCheck: {
          componentStatusPayloads: [
            {
              componentType: 'database',
              healthStatus: 'up'
            },
            {
              componentType: 'file',
              healthStatus: 'down'
            }
          ],
          healthStatus: 'down'
        }
      }
    });
  });

  it('GET /health database check fail, file check fail', async (): Promise<void> => {
    access.mockRejectedValueOnce(undefined);
    pingCheck.mockResolvedValueOnce({
      database: {
        status: 'down'
      }
    });

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
    });

    const { statusCode, body } = response;

    expect(access).toHaveBeenCalledTimes(1);
    expect(access).toHaveBeenNthCalledWith(1, '/app/package.json', constants.R_OK);
    expect(pingCheck).toHaveBeenCalledTimes(1);
    expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
      data: {
        healthCheck: {
          componentStatusPayloads: [
            {
              componentType: 'database',
              healthStatus: 'down'
            },
            {
              componentType: 'file',
              healthStatus: 'down'
            }
          ],
          healthStatus: 'down'
        }
      }
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
