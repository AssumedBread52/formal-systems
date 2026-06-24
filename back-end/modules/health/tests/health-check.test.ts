import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { accessMock } from '@/common/tests/mocks/access.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { ComponentType } from '@/health/enums/component-type.enum';
import { HealthStatus } from '@/health/enums/health-status.enum';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MongoConnectionError } from '@nestjs/terminus';
import { constants } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';
import request from 'supertest';

describe('Health Check', (): void => {
  const access = accessMock();
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query healthCheck', (): void => {
    it('reports down when the database and file checks both fail', async (): Promise<void> => {
      access.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
      });

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1', undefined);
      expect(response.body).toStrictEqual({
        data: {
          healthCheck: {
            componentStatusPayloads: [
              {
                componentType: ComponentType.database,
                healthStatus: HealthStatus.down
              },
              {
                componentType: ComponentType.file,
                healthStatus: HealthStatus.down
              }
            ],
            healthStatus: HealthStatus.down
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports down when the database check throws an unexpected error and the file check fails', async (): Promise<void> => {
      access.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(Object.assign(new MongoConnectionError(), {
        message: {
          status: 'should-not-exist'
        }
      }));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
      });

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1', undefined);
      expect(response.body).toStrictEqual({
        data: {
          healthCheck: {
            componentStatusPayloads: [
              {
                componentType: ComponentType.database,
                healthStatus: HealthStatus.down
              },
              {
                componentType: ComponentType.file,
                healthStatus: HealthStatus.down
              }
            ],
            healthStatus: HealthStatus.down
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports down when the database check fails', async (): Promise<void> => {
      access.mockResolvedValueOnce();
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
      });

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1', undefined);
      expect(response.body).toStrictEqual({
        data: {
          healthCheck: {
            componentStatusPayloads: [
              {
                componentType: ComponentType.database,
                healthStatus: HealthStatus.down
              },
              {
                componentType: ComponentType.file,
                healthStatus: HealthStatus.up
              }
            ],
            healthStatus: HealthStatus.down
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports down when the database check throws an unexpected error', async (): Promise<void> => {
      access.mockResolvedValueOnce();
      query.mockRejectedValueOnce(Object.assign(new MongoConnectionError(), {
        message: {
          status: 'should-not-exist'
        }
      }));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
      });

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1', undefined);
      expect(response.body).toStrictEqual({
        data: {
          healthCheck: {
            componentStatusPayloads: [
              {
                componentType: ComponentType.database,
                healthStatus: HealthStatus.down
              },
              {
                componentType: ComponentType.file,
                healthStatus: HealthStatus.up
              }
            ],
            healthStatus: HealthStatus.down
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports down when the file check fails', async (): Promise<void> => {
      access.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([
        {
          '?column?': 1
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
      });

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1', undefined);
      expect(response.body).toStrictEqual({
        data: {
          healthCheck: {
            componentStatusPayloads: [
              {
                componentType: ComponentType.database,
                healthStatus: HealthStatus.up
              },
              {
                componentType: ComponentType.file,
                healthStatus: HealthStatus.down
              }
            ],
            healthStatus: HealthStatus.down
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('all checks pass', async (): Promise<void> => {
      access.mockResolvedValueOnce();
      query.mockResolvedValueOnce(buildQueryResult([
        {
          '?column?': 1
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
      });

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1', undefined);
      expect(response.body).toStrictEqual({
        data: {
          healthCheck: {
            componentStatusPayloads: [
              {
                componentType: ComponentType.database,
                healthStatus: HealthStatus.up
              },
              {
                componentType: ComponentType.file,
                healthStatus: HealthStatus.up
              }
            ],
            healthStatus: HealthStatus.up
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST GET /health', (): void => {
    it('responds with 503 when the database and file checks both fail', async (): Promise<void> => {
      access.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get('/health');

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1', undefined);
      expect(response.body).toStrictEqual({
        componentStatusPayloads: [
          {
            componentType: ComponentType.database,
            healthStatus: HealthStatus.down
          },
          {
            componentType: ComponentType.file,
            healthStatus: HealthStatus.down
          }
        ],
        healthStatus: HealthStatus.down
      });
      expect(response.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('responds with 503 when the database check throws an unexpected error and the file check fails', async (): Promise<void> => {
      access.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(Object.assign(new MongoConnectionError(), {
        message: {
          status: 'should-not-exist'
        }
      }));

      const response = await request(app.getHttpServer()).get('/health');

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1', undefined);
      expect(response.body).toStrictEqual({
        componentStatusPayloads: [
          {
            componentType: ComponentType.database,
            healthStatus: HealthStatus.down
          },
          {
            componentType: ComponentType.file,
            healthStatus: HealthStatus.down
          }
        ],
        healthStatus: HealthStatus.down
      });
      expect(response.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('responds with 503 when the database check fails', async (): Promise<void> => {
      access.mockResolvedValueOnce();
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get('/health');

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1', undefined);
      expect(response.body).toStrictEqual({
        componentStatusPayloads: [
          {
            componentType: ComponentType.database,
            healthStatus: HealthStatus.down
          },
          {
            componentType: ComponentType.file,
            healthStatus: HealthStatus.up
          }
        ],
        healthStatus: HealthStatus.down
      });
      expect(response.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('responds with 503 when the database check throws an unexpected error', async (): Promise<void> => {
      access.mockResolvedValueOnce();
      query.mockRejectedValueOnce(Object.assign(new MongoConnectionError(), {
        message: {
          status: 'should-not-exist'
        }
      }));

      const response = await request(app.getHttpServer()).get('/health');

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1', undefined);
      expect(response.body).toStrictEqual({
        componentStatusPayloads: [
          {
            componentType: ComponentType.database,
            healthStatus: HealthStatus.down
          },
          {
            componentType: ComponentType.file,
            healthStatus: HealthStatus.up
          }
        ],
        healthStatus: HealthStatus.down
      });
      expect(response.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('responds with 503 when the file check fails', async (): Promise<void> => {
      access.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([
        {
          '?column?': 1
        }
      ]));

      const response = await request(app.getHttpServer()).get('/health');

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1', undefined);
      expect(response.body).toStrictEqual({
        componentStatusPayloads: [
          {
            componentType: ComponentType.database,
            healthStatus: HealthStatus.up
          },
          {
            componentType: ComponentType.file,
            healthStatus: HealthStatus.down
          }
        ],
        healthStatus: HealthStatus.down
      });
      expect(response.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('all checks pass', async (): Promise<void> => {
      access.mockResolvedValueOnce();
      query.mockResolvedValueOnce(buildQueryResult([
        {
          '?column?': 1
        }
      ]));

      const response = await request(app.getHttpServer()).get('/health');

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1', undefined);
      expect(response.body).toStrictEqual({
        componentStatusPayloads: [
          {
            componentType: ComponentType.database,
            healthStatus: HealthStatus.up
          },
          {
            componentType: ComponentType.file,
            healthStatus: HealthStatus.up
          }
        ],
        healthStatus: HealthStatus.up
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
