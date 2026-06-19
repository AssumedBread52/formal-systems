import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

const SYSTEM = 'ebe1615e-8c75-461a-b6f4-29db73a14ee7';
const STATEMENT = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const HYPOTHESIS = 'b2c3d4e5-f6a7-4889-9abc-def012345678';
const EXPRESSION = 'c3d4e5f6-a7b8-499a-9abc-def012345678';
const INCLUDE = 'd4e5f6a7-b8c9-4aab-9abc-def012345678';
const EXCLUDE = 'e5f6a7b8-c9da-4bbc-9abc-def012345678';
const SELECT = 'SELECT "HypothesisEntity"."id" AS "HypothesisEntity_id", "HypothesisEntity"."system_id" AS "HypothesisEntity_system_id", "HypothesisEntity"."statement_id" AS "HypothesisEntity_statement_id", "HypothesisEntity"."expression_id" AS "HypothesisEntity_expression_id", "HypothesisEntity"."type" AS "HypothesisEntity_type" FROM "statement_hypotheses" "HypothesisEntity"';
const NO_FILTER = `${SELECT} WHERE (("HypothesisEntity"."system_id" = $1) AND ("HypothesisEntity"."statement_id" = $2)) LIMIT 20 OFFSET 20`;
const NO_FILTER_COUNT = 'SELECT COUNT(1) AS "cnt" FROM "statement_hypotheses" "HypothesisEntity" WHERE (("HypothesisEntity"."system_id" = $1) AND ("HypothesisEntity"."statement_id" = $2))';
const INCLUDE_ONLY = `${SELECT} WHERE (("HypothesisEntity"."system_id" = $1) AND ("HypothesisEntity"."statement_id" = $2) AND ("HypothesisEntity"."expression_id" IN ($3))) LIMIT 20 OFFSET 20`;
const EXCLUDE_ONLY = `${SELECT} WHERE (("HypothesisEntity"."system_id" = $1) AND ("HypothesisEntity"."statement_id" = $2) AND (NOT("HypothesisEntity"."expression_id" IN ($3)))) LIMIT 20 OFFSET 20`;
const TYPES_ONLY = `${SELECT} WHERE (("HypothesisEntity"."system_id" = $1) AND ("HypothesisEntity"."statement_id" = $2) AND ("HypothesisEntity"."type" IN ($3))) LIMIT 20 OFFSET 20`;
const BOTH = `${SELECT} WHERE (("HypothesisEntity"."system_id" = $1) AND ("HypothesisEntity"."statement_id" = $2) AND (("HypothesisEntity"."expression_id" IN ($3) AND NOT("HypothesisEntity"."expression_id" IN ($4))))) LIMIT 20 OFFSET 20`;

describe('Read Hypotheses', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const hypothesisRow = (): Record<string, unknown> => {
    return {
      HypothesisEntity_id: HYPOTHESIS,
      HypothesisEntity_system_id: SYSTEM,
      HypothesisEntity_statement_id: STATEMENT,
      HypothesisEntity_expression_id: EXPRESSION,
      HypothesisEntity_type: 'logic'
    };
  };

  const result = (): Record<string, unknown> => {
    return { id: HYPOTHESIS, systemId: SYSTEM, statementId: STATEMENT, expressionId: EXPRESSION, type: 'logic' };
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query hypotheses', (): void => {
    const send = (filters: Record<string, unknown>): request.Test => {
      return request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $statementId: String!, $filters: SearchHypothesesPayload!) { hypotheses(systemId: $systemId, statementId: $statementId, filters: $filters) { results { id systemId statementId expressionId type } total } }',
        variables: { systemId: SYSTEM, statementId: STATEMENT, filters }
      });
    };

    it('returns a page of results without a filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow()]));

      const response = await send({ page: 2, pageSize: 20 });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, NO_FILTER, [SYSTEM, STATEMENT], true);
      expect(response.body).toStrictEqual({ data: { hypotheses: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with an include filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow()]));

      const response = await send({ page: 2, pageSize: 20, includeExpressionIds: [INCLUDE] });

      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, INCLUDE_ONLY, [SYSTEM, STATEMENT, INCLUDE], true);
      expect(response.body).toStrictEqual({ data: { hypotheses: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with an exclude filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow()]));

      const response = await send({ page: 2, pageSize: 20, excludeExpressionIds: [EXCLUDE] });

      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, EXCLUDE_ONLY, [SYSTEM, STATEMENT, EXCLUDE], true);
      expect(response.body).toStrictEqual({ data: { hypotheses: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with both include and exclude filters', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow()]));

      const response = await send({ page: 2, pageSize: 20, includeExpressionIds: [INCLUDE], excludeExpressionIds: [EXCLUDE] });

      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, BOTH, [SYSTEM, STATEMENT, INCLUDE, EXCLUDE], true);
      expect(response.body).toStrictEqual({ data: { hypotheses: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with a type filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow()]));

      const response = await send({ page: 2, pageSize: 20, types: ['logic'] });

      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, TYPES_ONLY, [SYSTEM, STATEMENT, 'logic'], true);
      expect(response.body).toStrictEqual({ data: { hypotheses: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of empty results', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 20 }]));

      const response = await send({ page: 2, pageSize: 20 });

      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, NO_FILTER, [SYSTEM, STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(2, NO_FILTER_COUNT, [SYSTEM, STATEMENT], true);
      expect(response.body).toStrictEqual({ data: { hypotheses: { results: [], total: 20 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database hypothesis search fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await send({ page: 2, pageSize: 20 });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Reading hypotheses failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the pagination values are out of range', async (): Promise<void> => {
      const response = await send({ page: 0, pageSize: -1 });

      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].extensions.originalError.message).toStrictEqual(['page must not be less than 1', 'pageSize must not be less than 1']);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST GET /system/:systemId/statement/:statementId/hypothesis', (): void => {
    const path = (params: string): string => `/system/${SYSTEM}/statement/${STATEMENT}/hypothesis?${params}`;

    it('returns a page of results without a filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow()]));

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20'));

      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, NO_FILTER, [SYSTEM, STATEMENT], true);
      expect(response.body).toStrictEqual({ results: [result()], total: 21 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with a type filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow()]));

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20&types[]=logic'));

      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, TYPES_ONLY, [SYSTEM, STATEMENT, 'logic'], true);
      expect(response.body).toStrictEqual({ results: [result()], total: 21 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of empty results', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 20 }]));

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20'));

      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, NO_FILTER_COUNT, [SYSTEM, STATEMENT], true);
      expect(response.body).toStrictEqual({ results: [], total: 20 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 500 when the database hypothesis search fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20'));

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Reading hypotheses failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the system id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get(`/system/not-a-uuid/statement/${STATEMENT}/hypothesis?page=2&pageSize=20`);

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
