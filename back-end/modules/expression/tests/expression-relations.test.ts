import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

const SYSTEM = 'ebe1615e-8c75-461a-b6f4-29db73a14ee7';
const EXPRESSION = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const SYMBOL = 'b2c3d4e5-f6a7-4889-9abc-def012345678';
const SELECT_BY_ID = 'SELECT "ExpressionEntity"."id" AS "ExpressionEntity_id", "ExpressionEntity"."system_id" AS "ExpressionEntity_system_id", "ExpressionEntity"."canonical" AS "ExpressionEntity_canonical" FROM "expressions" "ExpressionEntity" WHERE (("ExpressionEntity"."id" = $1) AND ("ExpressionEntity"."system_id" = $2)) LIMIT 1';
const TOKENS_LOADER = 'SELECT "ExpressionTokenEntity"."system_id" AS "ExpressionTokenEntity_system_id", "ExpressionTokenEntity"."symbol_id" AS "ExpressionTokenEntity_symbol_id", "ExpressionTokenEntity"."expression_id" AS "ExpressionTokenEntity_expression_id", "ExpressionTokenEntity"."position" AS "ExpressionTokenEntity_position" FROM "expression_tokens" "ExpressionTokenEntity" WHERE (("ExpressionTokenEntity"."expression_id" IN ($1)))';
const HYPOTHESES_LOADER = 'SELECT "HypothesisEntity"."id" AS "HypothesisEntity_id", "HypothesisEntity"."system_id" AS "HypothesisEntity_system_id", "HypothesisEntity"."statement_id" AS "HypothesisEntity_statement_id", "HypothesisEntity"."expression_id" AS "HypothesisEntity_expression_id", "HypothesisEntity"."type" AS "HypothesisEntity_type" FROM "statement_hypotheses" "HypothesisEntity" WHERE (("HypothesisEntity"."expression_id" IN ($1)))';
const STATEMENTS_LOADER = 'SELECT "StatementEntity"."id" AS "StatementEntity_id", "StatementEntity"."system_id" AS "StatementEntity_system_id", "StatementEntity"."assertion_expression_id" AS "StatementEntity_assertion_expression_id", "StatementEntity"."name" AS "StatementEntity_name", "StatementEntity"."description" AS "StatementEntity_description" FROM "statements" "StatementEntity" WHERE (("StatementEntity"."assertion_expression_id" IN ($1)))';
const SYSTEM_LOADER = 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" IN ($1)))';
const COLUMN = 120;

describe('Expression Relations', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const expressionRow = (): Record<string, unknown> => {
    return { ExpressionEntity_id: EXPRESSION, ExpressionEntity_system_id: SYSTEM, ExpressionEntity_canonical: [SYMBOL] };
  };

  const send = (field: string, sub: string): request.Test => {
    return request(app.getHttpServer()).post('/graphql').send({
      query: `query ($systemId: String!, $expressionId: String!) { expression(systemId: $systemId, expressionId: $expressionId) { id ${field} { ${sub} } } }`,
      variables: { systemId: SYSTEM, expressionId: EXPRESSION }
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
          path: ['expression', field]
        }
      ]
    };
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql expression', (): void => {
    it('resolves the expression tokens that make up the expression', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ ExpressionTokenEntity_system_id: SYSTEM, ExpressionTokenEntity_expression_id: EXPRESSION, ExpressionTokenEntity_position: 0 }]));

      const response = await send('expressionTokens', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [EXPRESSION, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(2, TOKENS_LOADER, [EXPRESSION], true);
      expect(response.body).toStrictEqual({ data: { expression: { id: EXPRESSION, expressionTokens: [{ systemId: SYSTEM }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves multiple expression tokens that make up the expression', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([
        { ExpressionTokenEntity_system_id: SYSTEM, ExpressionTokenEntity_expression_id: EXPRESSION, ExpressionTokenEntity_position: 0 },
        { ExpressionTokenEntity_system_id: SYSTEM, ExpressionTokenEntity_expression_id: EXPRESSION, ExpressionTokenEntity_position: 1 }
      ]));

      const response = await send('expressionTokens', 'position');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, TOKENS_LOADER, [EXPRESSION], true);
      expect(response.body).toStrictEqual({ data: { expression: { id: EXPRESSION, expressionTokens: [{ position: 0 }, { position: 1 }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when the expression has no tokens', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('expressionTokens', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, TOKENS_LOADER, [EXPRESSION], true);
      expect(response.body).toStrictEqual({ data: { expression: { id: EXPRESSION, expressionTokens: [] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the expression tokens fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('expressionTokens', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual(error('expressionTokens', 'Loading expression tokens by expression ID failed', HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the hypotheses that reference the expression', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ HypothesisEntity_system_id: SYSTEM, HypothesisEntity_expression_id: EXPRESSION }]));

      const response = await send('hypotheses', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, HYPOTHESES_LOADER, [EXPRESSION], true);
      expect(response.body).toStrictEqual({ data: { expression: { id: EXPRESSION, hypotheses: [{ systemId: SYSTEM }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves multiple hypotheses that reference the expression', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([
        { HypothesisEntity_id: 'c1c1c1c1-e5f6-4778-9abc-def012345678', HypothesisEntity_expression_id: EXPRESSION },
        { HypothesisEntity_id: 'c2c2c2c2-e5f6-4778-9abc-def012345678', HypothesisEntity_expression_id: EXPRESSION }
      ]));

      const response = await send('hypotheses', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, HYPOTHESES_LOADER, [EXPRESSION], true);
      expect(response.body).toStrictEqual({ data: { expression: { id: EXPRESSION, hypotheses: [{ id: 'c1c1c1c1-e5f6-4778-9abc-def012345678' }, { id: 'c2c2c2c2-e5f6-4778-9abc-def012345678' }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when no hypotheses reference the expression', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('hypotheses', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, HYPOTHESES_LOADER, [EXPRESSION], true);
      expect(response.body).toStrictEqual({ data: { expression: { id: EXPRESSION, hypotheses: [] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the hypotheses fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('hypotheses', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual(error('hypotheses', 'Loading hypotheses by expression ID failed', HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the statements that assert the expression', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ StatementEntity_system_id: SYSTEM, StatementEntity_assertion_expression_id: EXPRESSION }]));

      const response = await send('statements', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, STATEMENTS_LOADER, [EXPRESSION], true);
      expect(response.body).toStrictEqual({ data: { expression: { id: EXPRESSION, statements: [{ systemId: SYSTEM }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves multiple statements that assert the expression', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([
        { StatementEntity_id: 'c1c1c1c1-e5f6-4778-9abc-def012345678', StatementEntity_assertion_expression_id: EXPRESSION },
        { StatementEntity_id: 'c2c2c2c2-e5f6-4778-9abc-def012345678', StatementEntity_assertion_expression_id: EXPRESSION }
      ]));

      const response = await send('statements', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, STATEMENTS_LOADER, [EXPRESSION], true);
      expect(response.body).toStrictEqual({ data: { expression: { id: EXPRESSION, statements: [{ id: 'c1c1c1c1-e5f6-4778-9abc-def012345678' }, { id: 'c2c2c2c2-e5f6-4778-9abc-def012345678' }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when no statements assert the expression', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('statements', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, STATEMENTS_LOADER, [EXPRESSION], true);
      expect(response.body).toStrictEqual({ data: { expression: { id: EXPRESSION, statements: [] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the statements fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('statements', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual(error('statements', 'Loading statements by expression ID failed', HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the system the expression belongs to', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ SystemEntity_id: SYSTEM, SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82', SystemEntity_name: 'S', SystemEntity_description: 'D' }]));

      const response = await send('system', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, SYSTEM_LOADER, [SYSTEM], true);
      expect(response.body).toStrictEqual({ data: { expression: { id: EXPRESSION, system: { id: SYSTEM } } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the system is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('system', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, SYSTEM_LOADER, [SYSTEM], true);
      expect(response.body).toStrictEqual(error('system', 'System not found', HttpStatus.NOT_FOUND, 'Not Found'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the system fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
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
