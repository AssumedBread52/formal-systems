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
const SELECT_BY_ID = 'SELECT "DistinctVariablePairEntity"."system_id" AS "DistinctVariablePairEntity_system_id", "DistinctVariablePairEntity"."statement_id" AS "DistinctVariablePairEntity_statement_id", "DistinctVariablePairEntity"."variable_symbol_1_id" AS "DistinctVariablePairEntity_variable_symbol_1_id", "DistinctVariablePairEntity"."variable_symbol_2_id" AS "DistinctVariablePairEntity_variable_symbol_2_id" FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity" WHERE (("DistinctVariablePairEntity"."system_id" = $1) AND ("DistinctVariablePairEntity"."statement_id" = $2) AND ("DistinctVariablePairEntity"."variable_symbol_1_id" = $3) AND ("DistinctVariablePairEntity"."variable_symbol_2_id" = $4)) LIMIT 1';

describe('Read Distinct Variable Pair by ID', (): void => {
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

  describe('GraphQL POST /graphql query distinctVariablePair', (): void => {
    const send = (variables: Record<string, unknown>): request.Test => {
      return request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $statementId: String!, $variableSymbol1Id: String!, $variableSymbol2Id: String!) { distinctVariablePair(systemId: $systemId, statementId: $statementId, variableSymbol1Id: $variableSymbol1Id, variableSymbol2Id: $variableSymbol2Id) { systemId statementId variableSymbol1Id variableSymbol2Id } }',
        variables
      });
    };

    it('returns the requested distinct variable pair', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));

      const response = await send({ systemId: SYSTEM, statementId: STATEMENT, variableSymbol1Id: VAR1, variableSymbol2Id: VAR2 });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [SYSTEM, STATEMENT, VAR1, VAR2], true);
      expect(response.body).toStrictEqual({ data: { distinctVariablePair: result() } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('orders the variable symbol ids before querying', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));

      const response = await send({ systemId: SYSTEM, statementId: STATEMENT, variableSymbol1Id: VAR2, variableSymbol2Id: VAR1 });

      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [SYSTEM, STATEMENT, VAR1, VAR2], true);
      expect(response.body).toStrictEqual({ data: { distinctVariablePair: result() } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no distinct variable pair matches', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send({ systemId: SYSTEM, statementId: STATEMENT, variableSymbol1Id: VAR1, variableSymbol2Id: VAR2 });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Distinct variable pair not found');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await send({ systemId: SYSTEM, statementId: STATEMENT, variableSymbol1Id: VAR1, variableSymbol2Id: VAR2 });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Reading distinct variable pair failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when a variable symbol id is not a UUID', async (): Promise<void> => {
      const response = await send({ systemId: SYSTEM, statementId: STATEMENT, variableSymbol1Id: 'not-a-uuid', variableSymbol2Id: VAR2 });

      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Validation failed (uuid is expected)');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST GET /system/:systemId/statement/:statementId/distinct-variable-pair/:variableSymbol1Id/:variableSymbol2Id', (): void => {
    it('returns the requested distinct variable pair', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));

      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/statement/${STATEMENT}/distinct-variable-pair/${VAR1}/${VAR2}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [SYSTEM, STATEMENT, VAR1, VAR2], true);
      expect(response.body).toStrictEqual(result());
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when no distinct variable pair matches', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/statement/${STATEMENT}/distinct-variable-pair/${VAR1}/${VAR2}`);

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Distinct variable pair not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 500 when the database read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/statement/${STATEMENT}/distinct-variable-pair/${VAR1}/${VAR2}`);

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Reading distinct variable pair failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when a variable symbol id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/statement/${STATEMENT}/distinct-variable-pair/not-a-uuid/${VAR2}`);

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
