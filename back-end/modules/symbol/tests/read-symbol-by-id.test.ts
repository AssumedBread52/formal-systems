import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

const SELECT_BY_ID = 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE (("SymbolEntity"."id" = $1) AND ("SymbolEntity"."system_id" = $2)) LIMIT 1';

describe('Read Symbol by ID', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const symbolRow = (): Record<string, unknown> => {
    return {
      SymbolEntity_id: 'a1b2c3d4-e5f6-4778-9abc-def012345678',
      SymbolEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
      SymbolEntity_name: 'TestSymbol1',
      SymbolEntity_description: 'Test Symbol 1',
      SymbolEntity_type: 'constant',
      SymbolEntity_content: 'A'
    };
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query symbol', (): void => {
    it('returns the requested symbol', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $symbolId: String!) { symbol(systemId: $systemId, symbolId: $symbolId) { id systemId name description type content } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          symbolId: 'a1b2c3d4-e5f6-4778-9abc-def012345678'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [
        'a1b2c3d4-e5f6-4778-9abc-def012345678',
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          symbol: {
            id: 'a1b2c3d4-e5f6-4778-9abc-def012345678',
            systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            name: 'TestSymbol1',
            description: 'Test Symbol 1',
            type: 'constant',
            content: 'A'
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no symbol matches', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $symbolId: String!) { symbol(systemId: $systemId, symbolId: $symbolId) { id systemId name description type content } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          symbolId: 'a1b2c3d4-e5f6-4778-9abc-def012345678'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [
        'a1b2c3d4-e5f6-4778-9abc-def012345678',
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Not Found',
                message: 'Symbol not found',
                statusCode: HttpStatus.NOT_FOUND
              },
              status: HttpStatus.NOT_FOUND
            },
            locations: [
              {
                column: 50,
                line: 1
              }
            ],
            message: 'Symbol not found',
            path: [
              'symbol'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $symbolId: String!) { symbol(systemId: $systemId, symbolId: $symbolId) { id systemId name description type content } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          symbolId: 'a1b2c3d4-e5f6-4778-9abc-def012345678'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Reading symbol failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 50,
                line: 1
              }
            ],
            message: 'Reading symbol failed',
            path: [
              'symbol'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the system id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $symbolId: String!) { symbol(systemId: $systemId, symbolId: $symbolId) { id systemId name description type content } }',
        variables: {
          systemId: 'not-a-uuid',
          symbolId: 'a1b2c3d4-e5f6-4778-9abc-def012345678'
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
                column: 50,
                line: 1
              }
            ],
            message: 'Validation failed (uuid is expected)',
            path: [
              'symbol'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the symbol id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $symbolId: String!) { symbol(systemId: $systemId, symbolId: $symbolId) { id systemId name description type content } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          symbolId: 'not-a-uuid'
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
                column: 50,
                line: 1
              }
            ],
            message: 'Validation failed (uuid is expected)',
            path: [
              'symbol'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST GET /system/:systemId/symbol/:symbolId', (): void => {
    it('returns the requested symbol', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));

      const response = await request(app.getHttpServer()).get('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7/symbol/a1b2c3d4-e5f6-4778-9abc-def012345678');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [
        'a1b2c3d4-e5f6-4778-9abc-def012345678',
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        id: 'a1b2c3d4-e5f6-4778-9abc-def012345678',
        systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
        name: 'TestSymbol1',
        description: 'Test Symbol 1',
        type: 'constant',
        content: 'A'
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when no symbol matches', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).get('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7/symbol/a1b2c3d4-e5f6-4778-9abc-def012345678');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        error: 'Not Found',
        message: 'Symbol not found',
        statusCode: HttpStatus.NOT_FOUND
      });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 500 when the database read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7/symbol/a1b2c3d4-e5f6-4778-9abc-def012345678');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading symbol failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the system id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get('/system/not-a-uuid/symbol/a1b2c3d4-e5f6-4778-9abc-def012345678');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: 'Validation failed (uuid is expected)',
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the symbol id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7/symbol/not-a-uuid');

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
