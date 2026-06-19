import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

const SYSTEM = 'ebe1615e-8c75-461a-b6f4-29db73a14ee7';
const SYMBOL = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const TEXT_AND_TYPES = 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE (((("SymbolEntity"."system_id" = $1) AND ("SymbolEntity"."name" ILIKE $2) AND ("SymbolEntity"."type" IN ($3)))) OR ((("SymbolEntity"."system_id" = $4) AND ("SymbolEntity"."description" ILIKE $5) AND ("SymbolEntity"."type" IN ($6)))) OR ((("SymbolEntity"."system_id" = $7) AND ("SymbolEntity"."type" IN ($8)) AND ("SymbolEntity"."content" ILIKE $9)))) LIMIT 20 OFFSET 20';
const TEXT_ONLY = 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE (((("SymbolEntity"."system_id" = $1) AND ("SymbolEntity"."name" ILIKE $2))) OR ((("SymbolEntity"."system_id" = $3) AND ("SymbolEntity"."description" ILIKE $4))) OR ((("SymbolEntity"."system_id" = $5) AND ("SymbolEntity"."content" ILIKE $6)))) LIMIT 20 OFFSET 20';
const TYPES_ONLY = 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE (((("SymbolEntity"."system_id" = $1) AND ("SymbolEntity"."type" IN ($2, $3))))) LIMIT 20 OFFSET 20';
const NO_FILTER = 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE (((("SymbolEntity"."system_id" = $1)))) LIMIT 20 OFFSET 20';
const NO_FILTER_COUNT = 'SELECT COUNT(1) AS "cnt" FROM "symbols" "SymbolEntity" WHERE (((("SymbolEntity"."system_id" = $1))))';

describe('Read Symbols', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const symbolRow = (): Record<string, unknown> => {
    return {
      SymbolEntity_id: SYMBOL,
      SymbolEntity_system_id: SYSTEM,
      SymbolEntity_name: 'TestSymbol1',
      SymbolEntity_description: 'Test Symbol 1',
      SymbolEntity_type: 'constant',
      SymbolEntity_content: 'A'
    };
  };

  const result = (): Record<string, unknown> => {
    return {
      id: SYMBOL,
      systemId: SYSTEM,
      name: 'TestSymbol1',
      description: 'Test Symbol 1',
      type: 'constant',
      content: 'A'
    };
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query symbols', (): void => {
    const send = (filters: Record<string, unknown>): request.Test => {
      return request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $filters: SearchSymbolsPayload!) { symbols(systemId: $systemId, filters: $filters) { results { id systemId name description type content } total } }',
        variables: {
          systemId: SYSTEM,
          filters
        }
      });
    };

    it('returns a page of results with both filters', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));

      const response = await send({ page: 2, pageSize: 20, searchText: 'est', types: ['constant'] });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, TEXT_AND_TYPES, [
        SYSTEM, '%est%', 'constant', SYSTEM, '%est%', 'constant', SYSTEM, 'constant', '%est%'
      ], true);
      expect(response.body).toStrictEqual({ data: { symbols: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with a text filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));

      const response = await send({ page: 2, pageSize: 20, searchText: 'est' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, TEXT_ONLY, [
        SYSTEM, '%est%', SYSTEM, '%est%', SYSTEM, '%est%'
      ], true);
      expect(response.body).toStrictEqual({ data: { symbols: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with a type filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));

      const response = await send({ page: 2, pageSize: 20, types: ['constant', 'variable'] });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, TYPES_ONLY, [
        SYSTEM, 'constant', 'variable'
      ], true);
      expect(response.body).toStrictEqual({ data: { symbols: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results without a filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));

      const response = await send({ page: 2, pageSize: 20 });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, NO_FILTER, [SYSTEM], true);
      expect(response.body).toStrictEqual({ data: { symbols: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of empty results', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 20 }]));

      const response = await send({ page: 2, pageSize: 20 });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, NO_FILTER, [SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(2, NO_FILTER_COUNT, [SYSTEM], true);
      expect(response.body).toStrictEqual({ data: { symbols: { results: [], total: 20 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database symbol search fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await send({ page: 2, pageSize: 20 });

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
                message: 'Reading symbols failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [{ column: 63, line: 1 }],
            message: 'Reading symbols failed',
            path: ['symbols']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database symbol count fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());

      const response = await send({ page: 2, pageSize: 20 });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Reading symbols failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [{ column: 63, line: 1 }],
            message: 'Reading symbols failed',
            path: ['symbols']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the pagination values are out of range', async (): Promise<void> => {
      const response = await send({ page: 0, pageSize: -1 });

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
                message: [
                  'page must not be less than 1',
                  'pageSize must not be less than 1'
                ],
                statusCode: HttpStatus.BAD_REQUEST
              }
            },
            locations: [{ column: 63, line: 1 }],
            message: 'Bad Request Exception',
            path: ['symbols']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the search parameters are the wrong type', async (): Promise<void> => {
      const response = await send({ page: 'a', pageSize: 'a', searchText: [], types: 'constant' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.errors.every((error: { extensions: { code: string; }; }): boolean => error.extensions.code === 'BAD_USER_INPUT')).toBe(true);
    });

    it('reports an error when the system id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $filters: SearchSymbolsPayload!) { symbols(systemId: $systemId, filters: $filters) { results { id } total } }',
        variables: { systemId: 'not-a-uuid', filters: { page: 2, pageSize: 20 } }
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
            locations: [{ column: 63, line: 1 }],
            message: 'Validation failed (uuid is expected)',
            path: ['symbols']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST GET /system/:systemId/symbol', (): void => {
    const path = (params: string): string => `/system/${SYSTEM}/symbol?${params}`;

    it('returns a page of results with both filters', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20&searchText=est&types[]=constant'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, TEXT_AND_TYPES, [
        SYSTEM, '%est%', 'constant', SYSTEM, '%est%', 'constant', SYSTEM, 'constant', '%est%'
      ], true);
      expect(response.body).toStrictEqual({ results: [result()], total: 21 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with a text filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20&searchText=est'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, TEXT_ONLY, [
        SYSTEM, '%est%', SYSTEM, '%est%', SYSTEM, '%est%'
      ], true);
      expect(response.body).toStrictEqual({ results: [result()], total: 21 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with a type filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20&types[]=constant&types[]=variable'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, TYPES_ONLY, [
        SYSTEM, 'constant', 'variable'
      ], true);
      expect(response.body).toStrictEqual({ results: [result()], total: 21 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results without a filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, NO_FILTER, [SYSTEM], true);
      expect(response.body).toStrictEqual({ results: [result()], total: 21 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of empty results', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 20 }]));

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, NO_FILTER, [SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(2, NO_FILTER_COUNT, [SYSTEM], true);
      expect(response.body).toStrictEqual({ results: [], total: 20 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 500 when the database symbol search fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading symbols failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the database symbol count fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading symbols failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the pagination values are out of range', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get(path('page=0&pageSize=-1'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: [
          'page must not be less than 1',
          'pageSize must not be less than 1'
        ],
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the search parameters are the wrong type', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get(path('page=a&pageSize=a&types[]=nonsense&extra=true'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: [
          'property extra should not exist',
          'page must not be less than 1',
          'page must be an integer number',
          'pageSize must not be less than 1',
          'pageSize must be an integer number',
          'each value in types must be one of the following values: constant, variable'
        ],
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the system id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get('/system/not-a-uuid/symbol?page=2&pageSize=20');

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
