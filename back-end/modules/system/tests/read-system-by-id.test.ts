import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

describe('Read System by ID', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query system', (): void => {
    it('returns the requested system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            name: 'TestSystem1',
            description: 'Test System 1'
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no system matches', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Not Found',
                message: 'System not found',
                statusCode: HttpStatus.NOT_FOUND
              },
              status: HttpStatus.NOT_FOUND
            },
            locations: [
              {
                column: 30,
                line: 1
              }
            ],
            message: 'System not found',
            path: [
              'system'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Reading system failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 30,
                line: 1
              }
            ],
            message: 'Reading system failed',
            path: [
              'system'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'not-a-uuid'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'BAD_REQUEST',
              originalError: {
                error: 'Bad Request',
                message: 'Validation failed (uuid is expected)',
                statusCode: HttpStatus.BAD_REQUEST
              }
            },
            locations: [
              {
                column: 30,
                line: 1
              }
            ],
            message: 'Validation failed (uuid is expected)',
            path: [
              'system'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST GET /system/:systemId', (): void => {
    it('returns the requested system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));

      const response = await request(app.getHttpServer()).get('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'      ], true);
      expect(response.body).toStrictEqual({
        id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
        ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        name: 'TestSystem1',
        description: 'Test System 1'
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when no system matches', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).get('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'      ], true);
      expect(response.body).toStrictEqual({
        error: 'Not Found',
        message: 'System not found',
        statusCode: HttpStatus.NOT_FOUND
      });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 500 when the database read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'      ], true);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading system failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get('/system/not-a-uuid');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: 'Validation failed (uuid is expected)',
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
