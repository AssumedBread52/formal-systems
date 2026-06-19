import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

const SYSTEM = 'ebe1615e-8c75-461a-b6f4-29db73a14ee7';
const STATEMENT = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const EXPRESSION = 'b2c3d4e5-f6a7-4889-9abc-def012345678';
const INCLUDE = 'c3d4e5f6-a7b8-499a-9abc-def012345678';
const EXCLUDE = 'd4e5f6a7-b8c9-4aab-9abc-def012345678';
const SELECT = 'SELECT "StatementEntity"."id" AS "StatementEntity_id", "StatementEntity"."system_id" AS "StatementEntity_system_id", "StatementEntity"."assertion_expression_id" AS "StatementEntity_assertion_expression_id", "StatementEntity"."name" AS "StatementEntity_name", "StatementEntity"."description" AS "StatementEntity_description" FROM "statements" "StatementEntity"';
const NO_FILTER = `${SELECT} WHERE (((("StatementEntity"."system_id" = $1)))) LIMIT 20 OFFSET 20`;
const NO_FILTER_COUNT = 'SELECT COUNT(1) AS "cnt" FROM "statements" "StatementEntity" WHERE (((("StatementEntity"."system_id" = $1))))';
const TEXT_ONLY = `${SELECT} WHERE (((("StatementEntity"."system_id" = $1) AND ("StatementEntity"."name" ILIKE $2))) OR ((("StatementEntity"."system_id" = $3) AND ("StatementEntity"."description" ILIKE $4)))) LIMIT 20 OFFSET 20`;
const INCLUDE_ONLY = `${SELECT} WHERE (((("StatementEntity"."system_id" = $1) AND ("StatementEntity"."assertion_expression_id" IN ($2))))) LIMIT 20 OFFSET 20`;
const EXCLUDE_ONLY = `${SELECT} WHERE (((("StatementEntity"."system_id" = $1) AND (NOT("StatementEntity"."assertion_expression_id" IN ($2)))))) LIMIT 20 OFFSET 20`;
const BOTH = `${SELECT} WHERE (((("StatementEntity"."system_id" = $1) AND (("StatementEntity"."assertion_expression_id" IN ($2) AND NOT("StatementEntity"."assertion_expression_id" IN ($3))))))) LIMIT 20 OFFSET 20`;

describe('Read Statements', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const statementRow = (): Record<string, unknown> => {
    return {
      StatementEntity_id: STATEMENT,
      StatementEntity_system_id: SYSTEM,
      StatementEntity_assertion_expression_id: EXPRESSION,
      StatementEntity_name: 'TestStatement1',
      StatementEntity_description: 'Test Statement 1'
    };
  };

  const result = (): Record<string, unknown> => {
    return {
      id: STATEMENT,
      systemId: SYSTEM,
      assertionExpressionId: EXPRESSION,
      name: 'TestStatement1',
      description: 'Test Statement 1'
    };
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query statements', (): void => {
    const send = (filters: Record<string, unknown>): request.Test => {
      return request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $filters: SearchStatementsPayload!) { statements(systemId: $systemId, filters: $filters) { results { id systemId assertionExpressionId name description } total } }',
        variables: { systemId: SYSTEM, filters }
      });
    };

    it('returns a page of results without a filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));

      const response = await send({ page: 2, pageSize: 20 });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, NO_FILTER, [SYSTEM], true);
      expect(response.body).toStrictEqual({ data: { statements: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with a text filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));

      const response = await send({ page: 2, pageSize: 20, searchText: 'est' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, TEXT_ONLY, [SYSTEM, '%est%', SYSTEM, '%est%'], true);
      expect(response.body).toStrictEqual({ data: { statements: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with an include filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));

      const response = await send({ page: 2, pageSize: 20, includeExpressionIds: [INCLUDE] });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, INCLUDE_ONLY, [SYSTEM, INCLUDE], true);
      expect(response.body).toStrictEqual({ data: { statements: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with both include and exclude filters', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));

      const response = await send({ page: 2, pageSize: 20, includeExpressionIds: [INCLUDE], excludeExpressionIds: [EXCLUDE] });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, BOTH, [SYSTEM, INCLUDE, EXCLUDE], true);
      expect(response.body).toStrictEqual({ data: { statements: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with an exclude filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));

      const response = await send({ page: 2, pageSize: 20, excludeExpressionIds: [EXCLUDE] });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, EXCLUDE_ONLY, [SYSTEM, EXCLUDE], true);
      expect(response.body).toStrictEqual({ data: { statements: { results: [result()], total: 21 } } });
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
      expect(response.body).toStrictEqual({ data: { statements: { results: [], total: 20 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database statement search fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await send({ page: 2, pageSize: 20 });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Reading statements failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the pagination values are out of range', async (): Promise<void> => {
      const response = await send({ page: 0, pageSize: -1 });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].extensions.originalError.message).toStrictEqual(['page must not be less than 1', 'pageSize must not be less than 1']);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the system id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $filters: SearchStatementsPayload!) { statements(systemId: $systemId, filters: $filters) { results { id } total } }',
        variables: { systemId: 'not-a-uuid', filters: { page: 2, pageSize: 20 } }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Validation failed (uuid is expected)');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST GET /system/:systemId/statement', (): void => {
    const path = (params: string): string => `/system/${SYSTEM}/statement?${params}`;

    it('returns a page of results without a filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, NO_FILTER, [SYSTEM], true);
      expect(response.body).toStrictEqual({ results: [result()], total: 21 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with a text filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20&searchText=est'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, TEXT_ONLY, [SYSTEM, '%est%', SYSTEM, '%est%'], true);
      expect(response.body).toStrictEqual({ results: [result()], total: 21 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with an include filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));

      const response = await request(app.getHttpServer()).get(path(`page=2&pageSize=20&includeExpressionIds[]=${INCLUDE}`));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, INCLUDE_ONLY, [SYSTEM, INCLUDE], true);
      expect(response.body).toStrictEqual({ results: [result()], total: 21 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of empty results', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 20 }]));

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, NO_FILTER_COUNT, [SYSTEM], true);
      expect(response.body).toStrictEqual({ results: [], total: 20 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 500 when the database statement search fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20'));

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Reading statements failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
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
      const response = await request(app.getHttpServer()).get('/system/not-a-uuid/statement?page=2&pageSize=20');

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
