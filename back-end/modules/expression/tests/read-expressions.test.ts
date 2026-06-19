import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

const SYSTEM = 'ebe1615e-8c75-461a-b6f4-29db73a14ee7';
const EXPRESSION = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const INCLUDE = 'b2c3d4e5-f6a7-4889-9abc-def012345678';
const EXCLUDE = 'c3d4e5f6-a7b8-499a-9abc-def012345678';
const SELECT = 'SELECT "ExpressionEntity"."id" AS "ExpressionEntity_id", "ExpressionEntity"."system_id" AS "ExpressionEntity_system_id", "ExpressionEntity"."canonical" AS "ExpressionEntity_canonical" FROM "expressions" "ExpressionEntity"';
const BOTH = `${SELECT} WHERE (("ExpressionEntity"."system_id" = $1) AND (("ExpressionEntity"."canonical" @> $2 AND NOT("ExpressionEntity"."canonical" @> $3)))) LIMIT 20 OFFSET 20`;
const INCLUDE_ONLY = `${SELECT} WHERE (("ExpressionEntity"."system_id" = $1) AND ("ExpressionEntity"."canonical" @> $2)) LIMIT 20 OFFSET 20`;
const EXCLUDE_ONLY = `${SELECT} WHERE (("ExpressionEntity"."system_id" = $1) AND (NOT("ExpressionEntity"."canonical" @> $2))) LIMIT 20 OFFSET 20`;
const NO_FILTER = `${SELECT} WHERE (("ExpressionEntity"."system_id" = $1)) LIMIT 20 OFFSET 20`;
const NO_FILTER_COUNT = 'SELECT COUNT(1) AS "cnt" FROM "expressions" "ExpressionEntity" WHERE (("ExpressionEntity"."system_id" = $1))';

describe('Read Expressions', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const expressionRow = (): Record<string, unknown> => {
    return {
      ExpressionEntity_id: EXPRESSION,
      ExpressionEntity_system_id: SYSTEM,
      ExpressionEntity_canonical: [INCLUDE]
    };
  };

  const result = (): Record<string, unknown> => {
    return {
      id: EXPRESSION,
      systemId: SYSTEM,
      canonical: [INCLUDE]
    };
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query expressions', (): void => {
    const send = (filters: Record<string, unknown>): request.Test => {
      return request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $filters: SearchExpressionsPayload!) { expressions(systemId: $systemId, filters: $filters) { results { id systemId canonical } total } }',
        variables: { systemId: SYSTEM, filters }
      });
    };

    it('returns a page of results with both filters', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));

      const response = await send({ page: 2, pageSize: 20, includeSymbolIds: [INCLUDE], excludeSymbolIds: [EXCLUDE] });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, BOTH, [SYSTEM, [INCLUDE], [EXCLUDE]], true);
      expect(response.body).toStrictEqual({ data: { expressions: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with an include filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));

      const response = await send({ page: 2, pageSize: 20, includeSymbolIds: [INCLUDE] });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, INCLUDE_ONLY, [SYSTEM, [INCLUDE]], true);
      expect(response.body).toStrictEqual({ data: { expressions: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with an exclude filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));

      const response = await send({ page: 2, pageSize: 20, excludeSymbolIds: [EXCLUDE] });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, EXCLUDE_ONLY, [SYSTEM, [EXCLUDE]], true);
      expect(response.body).toStrictEqual({ data: { expressions: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results without a filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));

      const response = await send({ page: 2, pageSize: 20 });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, NO_FILTER, [SYSTEM], true);
      expect(response.body).toStrictEqual({ data: { expressions: { results: [result()], total: 21 } } });
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
      expect(response.body).toStrictEqual({ data: { expressions: { results: [], total: 20 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database expression search fails', async (): Promise<void> => {
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
              originalError: { error: 'Internal Server Error', message: 'Reading expressions failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [{ column: 67, line: 1 }],
            message: 'Reading expressions failed',
            path: ['expressions']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database expression count fails', async (): Promise<void> => {
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
              originalError: { error: 'Internal Server Error', message: 'Reading expressions failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [{ column: 67, line: 1 }],
            message: 'Reading expressions failed',
            path: ['expressions']
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
                message: ['page must not be less than 1', 'pageSize must not be less than 1'],
                statusCode: HttpStatus.BAD_REQUEST
              }
            },
            locations: [{ column: 67, line: 1 }],
            message: 'Bad Request Exception',
            path: ['expressions']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the search parameters are the wrong type', async (): Promise<void> => {
      const response = await send({ page: 'a', pageSize: 'a', includeSymbolIds: 'nope', excludeSymbolIds: 'nope' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.errors.every((error: { extensions: { code: string; }; }): boolean => error.extensions.code === 'BAD_USER_INPUT')).toBe(true);
    });

    it('reports an error when the system id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $filters: SearchExpressionsPayload!) { expressions(systemId: $systemId, filters: $filters) { results { id } total } }',
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
              originalError: { error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST }
            },
            locations: [{ column: 67, line: 1 }],
            message: 'Validation failed (uuid is expected)',
            path: ['expressions']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST GET /system/:systemId/expression', (): void => {
    const path = (params: string): string => `/system/${SYSTEM}/expression?${params}`;

    it('returns a page of results with both filters', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));

      const response = await request(app.getHttpServer()).get(path(`page=2&pageSize=20&includeSymbolIds[]=${INCLUDE}&excludeSymbolIds[]=${EXCLUDE}`));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, BOTH, [SYSTEM, [INCLUDE], [EXCLUDE]], true);
      expect(response.body).toStrictEqual({ results: [result()], total: 21 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with an include filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));

      const response = await request(app.getHttpServer()).get(path(`page=2&pageSize=20&includeSymbolIds[]=${INCLUDE}`));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, INCLUDE_ONLY, [SYSTEM, [INCLUDE]], true);
      expect(response.body).toStrictEqual({ results: [result()], total: 21 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with an exclude filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));

      const response = await request(app.getHttpServer()).get(path(`page=2&pageSize=20&excludeSymbolIds[]=${EXCLUDE}`));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, EXCLUDE_ONLY, [SYSTEM, [EXCLUDE]], true);
      expect(response.body).toStrictEqual({ results: [result()], total: 21 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results without a filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));

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

    it('responds with 500 when the database expression search fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Reading expressions failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the database expression count fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Reading expressions failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the pagination values are out of range', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get(path('page=0&pageSize=-1'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: ['page must not be less than 1', 'pageSize must not be less than 1'],
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the system id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get('/system/not-a-uuid/expression?page=2&pageSize=20');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
