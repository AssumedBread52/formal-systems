import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { accessMock } from '@/common/tests/mocks/access.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { pingCheckMock } from '@/common/tests/mocks/ping-check.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { ComponentType } from '@/health/enums/component-type.enum';
import { HealthStatus } from '@/health/enums/health-status.enum';
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
  const query = queryMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('REST', (): void => {
    it('file access check throws exception', async (): Promise<void> => {
      access.mockRejectedValueOnce(new Error());
      pingCheck.mockResolvedValueOnce({
        database: {
          status: HealthStatus.up
        }
      });

      const response = await request(app.getHttpServer()).get('/health');

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(pingCheck).toHaveBeenCalledTimes(1);
      expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
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

    it('database check throws exception', async (): Promise<void> => {
      access.mockResolvedValueOnce();
      pingCheck.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get('/health');

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(pingCheck).toHaveBeenCalledTimes(1);
      expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
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

    it('database is down', async (): Promise<void> => {
      access.mockResolvedValueOnce();
      pingCheck.mockResolvedValueOnce({
        database: {
          status: HealthStatus.down
        }
      });

      const response = await request(app.getHttpServer()).get('/health');

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(pingCheck).toHaveBeenCalledTimes(1);
      expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
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

    it('file access check throws exception and database is down', async (): Promise<void> => {
      access.mockRejectedValueOnce(new Error());
      pingCheck.mockResolvedValueOnce({
        database: {
          status: HealthStatus.down
        }
      });

      const response = await request(app.getHttpServer()).get('/health');

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(pingCheck).toHaveBeenCalledTimes(1);
      expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
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

    it('file access and database checks throw exceptions', async (): Promise<void> => {
      access.mockRejectedValueOnce(new Error());
      pingCheck.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get('/health');

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(pingCheck).toHaveBeenCalledTimes(1);
      expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
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

    it('success', async (): Promise<void> => {
      access.mockResolvedValueOnce();
      pingCheck.mockResolvedValueOnce({
        database: {
          status: HealthStatus.up
        }
      });

      const response = await request(app.getHttpServer()).get('/health');

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(pingCheck).toHaveBeenCalledTimes(1);
      expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
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

  describe('GraphQL', (): void => {
    it('file access check throws exception', async (): Promise<void> => {
      access.mockRejectedValueOnce(new Error());
      pingCheck.mockResolvedValueOnce({
        database: {
          status: HealthStatus.up
        }
      });

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
      });

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(pingCheck).toHaveBeenCalledTimes(1);
      expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
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

    it('database check throws exception', async (): Promise<void> => {
      access.mockResolvedValueOnce();
      pingCheck.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
      });

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(pingCheck).toHaveBeenCalledTimes(1);
      expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
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

    it('database is down', async (): Promise<void> => {
      access.mockResolvedValueOnce();
      pingCheck.mockResolvedValueOnce({
        database: {
          status: HealthStatus.down
        }
      });

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
      });

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(pingCheck).toHaveBeenCalledTimes(1);
      expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
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

    it('file access check throws exception and database is down', async (): Promise<void> => {
      access.mockRejectedValueOnce(new Error());
      pingCheck.mockResolvedValueOnce({
        database: {
          status: HealthStatus.down
        }
      });

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
      });

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(pingCheck).toHaveBeenCalledTimes(1);
      expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
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

    it('file access and database checks throw exceptions', async (): Promise<void> => {
      access.mockRejectedValueOnce(new Error());
      pingCheck.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
      });

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(pingCheck).toHaveBeenCalledTimes(1);
      expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
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

    it('success', async (): Promise<void> => {
      access.mockResolvedValueOnce();
      pingCheck.mockResolvedValueOnce({
        database: {
          status: HealthStatus.up
        }
      });

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { healthCheck { componentStatusPayloads { componentType healthStatus } healthStatus } }'
      });

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenNthCalledWith(1, join(cwd(), 'package-lock.json'), constants.R_OK);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(pingCheck).toHaveBeenCalledTimes(1);
      expect(pingCheck).toHaveBeenNthCalledWith(1, 'database');
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

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
