import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

const SYSTEM = 'ebe1615e-8c75-461a-b6f4-29db73a14ee7';
const STATEMENT = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const VAR1 = '11111111-e5f6-4778-9abc-def012345678';
const VAR2 = '22222222-e5f6-4778-9abc-def012345678';
const INCLUDE = '33333333-e5f6-4778-9abc-def012345678';
const EXCLUDE = '44444444-e5f6-4778-9abc-def012345678';
const SELECT = 'SELECT "DistinctVariablePairEntity"."system_id" AS "DistinctVariablePairEntity_system_id", "DistinctVariablePairEntity"."statement_id" AS "DistinctVariablePairEntity_statement_id", "DistinctVariablePairEntity"."variable_symbol_1_id" AS "DistinctVariablePairEntity_variable_symbol_1_id", "DistinctVariablePairEntity"."variable_symbol_2_id" AS "DistinctVariablePairEntity_variable_symbol_2_id" FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity"';
const NO_FILTER = `${SELECT} WHERE (((("DistinctVariablePairEntity"."system_id" = $1) AND ("DistinctVariablePairEntity"."statement_id" = $2)))) LIMIT 20 OFFSET 20`;
const NO_FILTER_COUNT = 'SELECT COUNT(1) AS "cnt" FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity" WHERE (((("DistinctVariablePairEntity"."system_id" = $1) AND ("DistinctVariablePairEntity"."statement_id" = $2))))';
const INCLUDE_ONLY = `${SELECT} WHERE (((("DistinctVariablePairEntity"."system_id" = $1) AND ("DistinctVariablePairEntity"."statement_id" = $2) AND ("DistinctVariablePairEntity"."variable_symbol_1_id" IN ($3)))) OR ((("DistinctVariablePairEntity"."system_id" = $4) AND ("DistinctVariablePairEntity"."statement_id" = $5) AND ("DistinctVariablePairEntity"."variable_symbol_2_id" IN ($6))))) LIMIT 20 OFFSET 20`;
const EXCLUDE_ONLY = `${SELECT} WHERE (((("DistinctVariablePairEntity"."system_id" = $1) AND ("DistinctVariablePairEntity"."statement_id" = $2) AND (NOT("DistinctVariablePairEntity"."variable_symbol_1_id" IN ($3))) AND (NOT("DistinctVariablePairEntity"."variable_symbol_2_id" IN ($4)))))) LIMIT 20 OFFSET 20`;
const BOTH = `${SELECT} WHERE (((("DistinctVariablePairEntity"."system_id" = $1) AND ("DistinctVariablePairEntity"."statement_id" = $2) AND ((NOT("DistinctVariablePairEntity"."variable_symbol_1_id" IN ($3)) AND "DistinctVariablePairEntity"."variable_symbol_1_id" IN ($4))) AND (NOT("DistinctVariablePairEntity"."variable_symbol_2_id" IN ($5))))) OR ((("DistinctVariablePairEntity"."system_id" = $6) AND ("DistinctVariablePairEntity"."statement_id" = $7) AND (NOT("DistinctVariablePairEntity"."variable_symbol_1_id" IN ($8))) AND ((NOT("DistinctVariablePairEntity"."variable_symbol_2_id" IN ($9)) AND "DistinctVariablePairEntity"."variable_symbol_2_id" IN ($10)))))) LIMIT 20 OFFSET 20`;

describe('Read Distinct Variable Pairs', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const pairRow = (): Record<string, unknown> => {
    return {
      DistinctVariablePairEntity_system_id: SYSTEM,
      DistinctVariablePairEntity_statement_id: STATEMENT,
      DistinctVariablePairEntity_variable_symbol_1_id: VAR1,
      DistinctVariablePairEntity_variable_symbol_2_id: VAR2
    };
  };

  const result = (): Record<string, unknown> => {
    return { systemId: SYSTEM, statementId: STATEMENT, variableSymbol1Id: VAR1, variableSymbol2Id: VAR2 };
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query distinctVariablePairs', (): void => {
    const send = (filters: Record<string, unknown>): request.Test => {
      return request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $statementId: String!, $filters: SearchDistinctVariablePairsPayload!) { distinctVariablePairs(systemId: $systemId, statementId: $statementId, filters: $filters) { results { systemId statementId variableSymbol1Id variableSymbol2Id } total } }',
        variables: { systemId: SYSTEM, statementId: STATEMENT, filters }
      });
    };

    it('returns a page of results without a filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));

      const response = await send({ page: 2, pageSize: 20 });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, NO_FILTER, [SYSTEM, STATEMENT], true);
      expect(response.body).toStrictEqual({ data: { distinctVariablePairs: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with an include filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));

      const response = await send({ page: 2, pageSize: 20, includeSymbolIds: [INCLUDE] });

      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, INCLUDE_ONLY, [SYSTEM, STATEMENT, INCLUDE, SYSTEM, STATEMENT, INCLUDE], true);
      expect(response.body).toStrictEqual({ data: { distinctVariablePairs: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with both include and exclude filters', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));

      const response = await send({ page: 2, pageSize: 20, includeSymbolIds: [INCLUDE], excludeSymbolIds: [EXCLUDE] });

      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, BOTH, [SYSTEM, STATEMENT, EXCLUDE, INCLUDE, EXCLUDE, SYSTEM, STATEMENT, EXCLUDE, EXCLUDE, INCLUDE], true);
      expect(response.body).toStrictEqual({ data: { distinctVariablePairs: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with an exclude filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));

      const response = await send({ page: 2, pageSize: 20, excludeSymbolIds: [EXCLUDE] });

      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, EXCLUDE_ONLY, [SYSTEM, STATEMENT, EXCLUDE, EXCLUDE], true);
      expect(response.body).toStrictEqual({ data: { distinctVariablePairs: { results: [result()], total: 21 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of empty results', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 20 }]));

      const response = await send({ page: 2, pageSize: 20 });

      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, NO_FILTER, [SYSTEM, STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(2, NO_FILTER_COUNT, [SYSTEM, STATEMENT], true);
      expect(response.body).toStrictEqual({ data: { distinctVariablePairs: { results: [], total: 20 } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database search fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await send({ page: 2, pageSize: 20 });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Reading distinct variable pairs failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the pagination values are out of range', async (): Promise<void> => {
      const response = await send({ page: 0, pageSize: -1 });

      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].extensions.originalError.message).toStrictEqual(['page must not be less than 1', 'pageSize must not be less than 1']);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST GET /system/:systemId/statement/:statementId/distinct-variable-pair', (): void => {
    const path = (params: string): string => `/system/${SYSTEM}/statement/${STATEMENT}/distinct-variable-pair?${params}`;

    it('returns a page of results without a filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20'));

      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, NO_FILTER, [SYSTEM, STATEMENT], true);
      expect(response.body).toStrictEqual({ results: [result()], total: 21 });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with an include filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));

      const response = await request(app.getHttpServer()).get(path(`page=2&pageSize=20&includeSymbolIds[]=${INCLUDE}`));

      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, INCLUDE_ONLY, [SYSTEM, STATEMENT, INCLUDE, SYSTEM, STATEMENT, INCLUDE], true);
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

    it('responds with 500 when the database search fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get(path('page=2&pageSize=20'));

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Reading distinct variable pairs failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the system id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get(`/system/not-a-uuid/statement/${STATEMENT}/distinct-variable-pair?page=2&pageSize=20`);

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
