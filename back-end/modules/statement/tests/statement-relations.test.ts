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
const SELECT_BY_ID = 'SELECT "StatementEntity"."id" AS "StatementEntity_id", "StatementEntity"."system_id" AS "StatementEntity_system_id", "StatementEntity"."assertion_expression_id" AS "StatementEntity_assertion_expression_id", "StatementEntity"."name" AS "StatementEntity_name", "StatementEntity"."description" AS "StatementEntity_description" FROM "statements" "StatementEntity" WHERE (("StatementEntity"."id" = $1) AND ("StatementEntity"."system_id" = $2)) LIMIT 1';
const ASSERTION_LOADER = 'SELECT "ExpressionEntity"."id" AS "ExpressionEntity_id", "ExpressionEntity"."system_id" AS "ExpressionEntity_system_id", "ExpressionEntity"."canonical" AS "ExpressionEntity_canonical" FROM "expressions" "ExpressionEntity" WHERE (("ExpressionEntity"."id" IN ($1)))';
const DVP_LOADER = 'SELECT "DistinctVariablePairEntity"."system_id" AS "DistinctVariablePairEntity_system_id", "DistinctVariablePairEntity"."statement_id" AS "DistinctVariablePairEntity_statement_id", "DistinctVariablePairEntity"."variable_symbol_1_id" AS "DistinctVariablePairEntity_variable_symbol_1_id", "DistinctVariablePairEntity"."variable_symbol_2_id" AS "DistinctVariablePairEntity_variable_symbol_2_id" FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity" WHERE (("DistinctVariablePairEntity"."statement_id" IN ($1)))';
const HYP_LOADER = 'SELECT "HypothesisEntity"."id" AS "HypothesisEntity_id", "HypothesisEntity"."system_id" AS "HypothesisEntity_system_id", "HypothesisEntity"."statement_id" AS "HypothesisEntity_statement_id", "HypothesisEntity"."expression_id" AS "HypothesisEntity_expression_id", "HypothesisEntity"."type" AS "HypothesisEntity_type" FROM "statement_hypotheses" "HypothesisEntity" WHERE (("HypothesisEntity"."statement_id" IN ($1)))';
const SYSTEM_LOADER = 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" IN ($1)))';
const COLUMN = 116;

describe('Statement Relations', (): void => {
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

  const send = (field: string, sub: string): request.Test => {
    return request(app.getHttpServer()).post('/graphql').send({
      query: `query ($systemId: String!, $statementId: String!) { statement(systemId: $systemId, statementId: $statementId) { id ${field} { ${sub} } } }`,
      variables: { systemId: SYSTEM, statementId: STATEMENT }
    });
  };

  const error = (field: string, message: string, statusCode: number, errorLabel: string): Record<string, unknown> => {
    return {
      data: null,
      errors: [
        {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            originalError: { error: errorLabel, message, statusCode },
            status: statusCode
          },
          locations: [{ column: COLUMN, line: 1 }],
          message,
          path: ['statement', field]
        }
      ]
    };
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql statement', (): void => {
    it('resolves the asserted expression', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ ExpressionEntity_id: EXPRESSION, ExpressionEntity_system_id: SYSTEM, ExpressionEntity_canonical: [] }]));

      const response = await send('assertion', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [STATEMENT, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(2, ASSERTION_LOADER, [EXPRESSION], true);
      expect(response.body).toStrictEqual({ data: { statement: { id: STATEMENT, assertion: { id: EXPRESSION } } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the asserted expression is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('assertion', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual(error('assertion', 'Expression not found', HttpStatus.NOT_FOUND, 'Not Found'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the asserted expression fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('assertion', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual(error('assertion', 'Loading expressions by ID failed', HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the distinct variable pairs attached to the statement', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ DistinctVariablePairEntity_system_id: SYSTEM, DistinctVariablePairEntity_statement_id: STATEMENT }]));

      const response = await send('distinctVariablePairs', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, DVP_LOADER, [STATEMENT], true);
      expect(response.body).toStrictEqual({ data: { statement: { id: STATEMENT, distinctVariablePairs: [{ systemId: SYSTEM }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves multiple distinct variable pairs attached to the statement', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([
        { DistinctVariablePairEntity_system_id: SYSTEM, DistinctVariablePairEntity_statement_id: STATEMENT, DistinctVariablePairEntity_variable_symbol_1_id: '11111111-e5f6-4778-9abc-def012345678' },
        { DistinctVariablePairEntity_system_id: SYSTEM, DistinctVariablePairEntity_statement_id: STATEMENT, DistinctVariablePairEntity_variable_symbol_1_id: '22222222-e5f6-4778-9abc-def012345678' }
      ]));

      const response = await send('distinctVariablePairs', 'variableSymbol1Id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, DVP_LOADER, [STATEMENT], true);
      expect(response.body).toStrictEqual({ data: { statement: { id: STATEMENT, distinctVariablePairs: [{ variableSymbol1Id: '11111111-e5f6-4778-9abc-def012345678' }, { variableSymbol1Id: '22222222-e5f6-4778-9abc-def012345678' }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when the statement has no distinct variable pairs', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('distinctVariablePairs', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, DVP_LOADER, [STATEMENT], true);
      expect(response.body).toStrictEqual({ data: { statement: { id: STATEMENT, distinctVariablePairs: [] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the distinct variable pairs fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('distinctVariablePairs', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual(error('distinctVariablePairs', 'Loading distinct variable pairs by statement ID failed', HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the hypotheses attached to the statement', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ HypothesisEntity_system_id: SYSTEM, HypothesisEntity_statement_id: STATEMENT }]));

      const response = await send('hypotheses', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, HYP_LOADER, [STATEMENT], true);
      expect(response.body).toStrictEqual({ data: { statement: { id: STATEMENT, hypotheses: [{ systemId: SYSTEM }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves multiple hypotheses attached to the statement', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([
        { HypothesisEntity_id: 'c1c1c1c1-e5f6-4778-9abc-def012345678', HypothesisEntity_system_id: SYSTEM, HypothesisEntity_statement_id: STATEMENT },
        { HypothesisEntity_id: 'c2c2c2c2-e5f6-4778-9abc-def012345678', HypothesisEntity_system_id: SYSTEM, HypothesisEntity_statement_id: STATEMENT }
      ]));

      const response = await send('hypotheses', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, HYP_LOADER, [STATEMENT], true);
      expect(response.body).toStrictEqual({ data: { statement: { id: STATEMENT, hypotheses: [{ id: 'c1c1c1c1-e5f6-4778-9abc-def012345678' }, { id: 'c2c2c2c2-e5f6-4778-9abc-def012345678' }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when the statement has no hypotheses', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('hypotheses', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, HYP_LOADER, [STATEMENT], true);
      expect(response.body).toStrictEqual({ data: { statement: { id: STATEMENT, hypotheses: [] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the hypotheses fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('hypotheses', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual(error('hypotheses', 'Loading hypotheses by statement ID failed', HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the system the statement belongs to', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ SystemEntity_id: SYSTEM, SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82', SystemEntity_name: 'S', SystemEntity_description: 'D' }]));

      const response = await send('system', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, SYSTEM_LOADER, [SYSTEM], true);
      expect(response.body).toStrictEqual({ data: { statement: { id: STATEMENT, system: { id: SYSTEM } } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the system is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('system', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual(error('system', 'System not found', HttpStatus.NOT_FOUND, 'Not Found'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the system fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('system', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual(error('system', 'Loading systems by ID failed', HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
