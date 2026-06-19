import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import request from 'supertest';

const USER = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
const SYSTEM = 'ebe1615e-8c75-461a-b6f4-29db73a14ee7';
const STATEMENT = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const HYPOTHESIS = 'b2c3d4e5-f6a7-4889-9abc-def012345678';
const EXPRESSION = 'c3d4e5f6-a7b8-499a-9abc-def012345678';
const GUARD_SELECT = 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1';
const VERIFY_OWNERSHIP = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1) AND ("SystemEntity"."owner_user_id" = $2))) LIMIT 1';
const VERIFY_STATEMENT_EXISTS = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "statements" "StatementEntity" WHERE (("StatementEntity"."id" = $1) AND ("StatementEntity"."system_id" = $2))) LIMIT 1';
const VERIFY_EXPRESSION_EXISTS = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "expressions" "ExpressionEntity" WHERE (("ExpressionEntity"."id" = $1) AND ("ExpressionEntity"."system_id" = $2))) LIMIT 1';
const VERIFY_UNIQUE_HYPOTHESIS = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "statement_hypotheses" "HypothesisEntity" WHERE (("HypothesisEntity"."statement_id" = $1) AND ("HypothesisEntity"."expression_id" = $2))) LIMIT 1';
const VERIFY_EXPRESSION_TYPE = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "expression_tokens" "ExpressionTokenEntity" LEFT JOIN "symbols" "ExpressionTokenEntity__ExpressionTokenEntity_symbol" ON "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."system_id"="ExpressionTokenEntity"."system_id" AND "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."id"="ExpressionTokenEntity"."symbol_id" WHERE (("ExpressionTokenEntity"."expression_id" = $1) AND ("ExpressionTokenEntity"."position" = $2) AND ((("ExpressionTokenEntity__ExpressionTokenEntity_symbol"."type" = $3))))) LIMIT 1';
const EXCEEDS_MAX_LENGTH = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "expression_tokens" "ExpressionTokenEntity" WHERE (("ExpressionTokenEntity"."expression_id" = $1) AND ("ExpressionTokenEntity"."position" > $2))) LIMIT 1';
const VARIABLE_SYMBOL_COUNT = 'SELECT COUNT(DISTINCT("ExpressionTokenEntity"."expression_id", "ExpressionTokenEntity"."position")) AS "cnt" FROM "expression_tokens" "ExpressionTokenEntity" LEFT JOIN "symbols" "ExpressionTokenEntity__ExpressionTokenEntity_symbol" ON "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."system_id"="ExpressionTokenEntity"."system_id" AND "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."id"="ExpressionTokenEntity"."symbol_id" WHERE (("ExpressionTokenEntity"."expression_id" = $1) AND ((("ExpressionTokenEntity__ExpressionTokenEntity_symbol"."type" = $2))))';
const TYPED_SYMBOL_COUNT = 'SELECT COUNT(DISTINCT("ExpressionTokenEntity"."expression_id", "ExpressionTokenEntity"."position")) AS "cnt" FROM "expression_tokens" "ExpressionTokenEntity" LEFT JOIN "symbols" "ExpressionTokenEntity__ExpressionTokenEntity_symbol" ON "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."system_id"="ExpressionTokenEntity"."system_id" AND "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."id"="ExpressionTokenEntity"."symbol_id"  LEFT JOIN "expression_tokens" "8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e" ON "8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."system_id"="ExpressionTokenEntity__ExpressionTokenEntity_symbol"."system_id" AND "8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."symbol_id"="ExpressionTokenEntity__ExpressionTokenEntity_symbol"."id"  LEFT JOIN "expressions" "8111f77118d533dd6c7d0fd4bacf7b7c3c1ed70c" ON "8111f77118d533dd6c7d0fd4bacf7b7c3c1ed70c"."system_id"="8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."system_id" AND "8111f77118d533dd6c7d0fd4bacf7b7c3c1ed70c"."id"="8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."expression_id"  LEFT JOIN "statement_hypotheses" "82600074aeee895e9f7db2a20e16218c6e85179c" ON "82600074aeee895e9f7db2a20e16218c6e85179c"."system_id"="8111f77118d533dd6c7d0fd4bacf7b7c3c1ed70c"."system_id" AND "82600074aeee895e9f7db2a20e16218c6e85179c"."expression_id"="8111f77118d533dd6c7d0fd4bacf7b7c3c1ed70c"."id" WHERE (("ExpressionTokenEntity"."expression_id" = $1) AND ((("ExpressionTokenEntity__ExpressionTokenEntity_symbol"."type" = $2) AND ((("8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."position" = $3) AND (((((\"82600074aeee895e9f7db2a20e16218c6e85179c\".\"statement_id\" = $4) AND (\"82600074aeee895e9f7db2a20e16218c6e85179c\".\"type\" = $5))))))))))';
const UNIQUE_VARIABLE_SYMBOL_TYPE = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "statement_hypotheses" "HypothesisEntity" LEFT JOIN "expressions" "HypothesisEntity__HypothesisEntity_expression" ON "HypothesisEntity__HypothesisEntity_expression"."system_id"="HypothesisEntity"."system_id" AND "HypothesisEntity__HypothesisEntity_expression"."id"="HypothesisEntity"."expression_id"  LEFT JOIN "expression_tokens" "4a32f25ced3bb72ba3e9c24323aef9beddeacc0f" ON "4a32f25ced3bb72ba3e9c24323aef9beddeacc0f"."system_id"="HypothesisEntity__HypothesisEntity_expression"."system_id" AND "4a32f25ced3bb72ba3e9c24323aef9beddeacc0f"."expression_id"="HypothesisEntity__HypothesisEntity_expression"."id"  LEFT JOIN "symbols" "a53ec491ad31f13424339bc7e65b74080f1d4c7d" ON "a53ec491ad31f13424339bc7e65b74080f1d4c7d"."system_id"="4a32f25ced3bb72ba3e9c24323aef9beddeacc0f"."system_id" AND "a53ec491ad31f13424339bc7e65b74080f1d4c7d"."id"="4a32f25ced3bb72ba3e9c24323aef9beddeacc0f"."symbol_id"  LEFT JOIN "expression_tokens" "032182e0e98e3033bf325845e55fb9db4460f2b0" ON "032182e0e98e3033bf325845e55fb9db4460f2b0"."system_id"="a53ec491ad31f13424339bc7e65b74080f1d4c7d"."system_id" AND "032182e0e98e3033bf325845e55fb9db4460f2b0"."symbol_id"="a53ec491ad31f13424339bc7e65b74080f1d4c7d"."id" WHERE (("HypothesisEntity"."statement_id" = $1) AND ("HypothesisEntity"."type" = $2) AND (((((\"4a32f25ced3bb72ba3e9c24323aef9beddeacc0f\".\"position\" = $3) AND (((((\"032182e0e98e3033bf325845e55fb9db4460f2b0\".\"expression_id\" = $4) AND (\"032182e0e98e3033bf325845e55fb9db4460f2b0\".\"position\" = $5))))))))))) LIMIT 1';
const INSERT_HYPOTHESIS = 'INSERT INTO "statement_hypotheses"("id", "system_id", "statement_id", "expression_id", "type") VALUES (DEFAULT, $1, $2, $3, $4) RETURNING "id"';

describe('Create Hypothesis', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const guardUser = (): Record<string, unknown> => {
    return { UserEntity_id: USER, UserEntity_handle: 'Test1 User1', UserEntity_email: 'test1.user1@example.com', UserEntity_password_hash: hashSync('Test1User1!') };
  };

  const token = (): string => app.get(JwtService).sign({ userId: USER });

  const gql = (hypothesisPayload: Record<string, unknown>, ids: { systemId?: string; statementId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token()}`]).send({
      query: 'mutation ($systemId: String!, $statementId: String!, $hypothesisPayload: NewHypothesisPayload!) { createHypothesis(systemId: $systemId, statementId: $statementId, hypothesisPayload: $hypothesisPayload) { id systemId statementId expressionId type } }',
      variables: { systemId: ids.systemId ?? SYSTEM, statementId: ids.statementId ?? STATEMENT, hypothesisPayload }
    });
  };

  const rest = (body: Record<string, unknown>, ids: { systemId?: string; statementId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).post(`/system/${ids.systemId ?? SYSTEM}/statement/${ids.statementId ?? STATEMENT}/hypothesis`).set('Cookie', [`token=${token()}`]).send(body);
  };

  const created = (type: string): Record<string, unknown> => {
    return { id: HYPOTHESIS, systemId: SYSTEM, statementId: STATEMENT, expressionId: EXPRESSION, type };
  };

  const preamble = (): void => {
    query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
    query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
    query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
    query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation createHypothesis', (): void => {
    it('creates a logic hypothesis', async (): Promise<void> => {
      preamble();
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: HYPOTHESIS }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ expressionId: EXPRESSION, type: 'logic' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(query).toHaveBeenNthCalledWith(2, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_STATEMENT_EXISTS, [STATEMENT, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_EXPRESSION_EXISTS, [EXPRESSION, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(5, VERIFY_UNIQUE_HYPOTHESIS, [STATEMENT, EXPRESSION], true);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(7, 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      expect(query).toHaveBeenNthCalledWith(8, VERIFY_EXPRESSION_TYPE, [EXPRESSION, 0, 'constant'], true);
      expect(query).toHaveBeenNthCalledWith(9, VARIABLE_SYMBOL_COUNT, [EXPRESSION, 'variable'], true);
      expect(query).toHaveBeenNthCalledWith(10, TYPED_SYMBOL_COUNT, [EXPRESSION, 'variable', 1, STATEMENT, 'type'], true);
      expect(query).toHaveBeenNthCalledWith(11, INSERT_HYPOTHESIS, [SYSTEM, STATEMENT, EXPRESSION, 'logic'], true);
      expect(query).toHaveBeenNthCalledWith(12, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { createHypothesis: created('logic') } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('creates a type hypothesis', async (): Promise<void> => {
      preamble();
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: HYPOTHESIS }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ expressionId: EXPRESSION, type: 'type' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(13);
      expect(query).toHaveBeenNthCalledWith(8, VERIFY_EXPRESSION_TYPE, [EXPRESSION, 0, 'constant'], true);
      expect(query).toHaveBeenNthCalledWith(9, VERIFY_EXPRESSION_TYPE, [EXPRESSION, 1, 'variable'], true);
      expect(query).toHaveBeenNthCalledWith(10, EXCEEDS_MAX_LENGTH, [EXPRESSION, 1], true);
      expect(query).toHaveBeenNthCalledWith(11, UNIQUE_VARIABLE_SYMBOL_TYPE, [STATEMENT, 'type', 1, EXPRESSION, 1], true);
      expect(query).toHaveBeenNthCalledWith(12, INSERT_HYPOTHESIS, [SYSTEM, STATEMENT, EXPRESSION, 'type'], true);
      expect(query).toHaveBeenNthCalledWith(13, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { createHypothesis: created('type') } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body.errors[0].message).toBe('User does not own the resource');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the statement does not exist', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_STATEMENT_EXISTS, [STATEMENT, SYSTEM], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Statement not found');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the expression does not exist', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_EXPRESSION_EXISTS, [EXPRESSION, SYSTEM], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Expression not found');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the hypothesis expression is already used', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await gql({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(5, VERIFY_UNIQUE_HYPOTHESIS, [STATEMENT, EXPRESSION], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('The hypotheses in a statement should be unique');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.CONFLICT);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when a logic hypothesis expression is not constant prefixed', async (): Promise<void> => {
      preamble();
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(8, VERIFY_EXPRESSION_TYPE, [EXPRESSION, 0, 'constant'], true);
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Expression type is invalid');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when a logic hypothesis has untyped variables', async (): Promise<void> => {
      preamble();
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(11);
      expect(query).toHaveBeenNthCalledWith(10, TYPED_SYMBOL_COUNT, [EXPRESSION, 'variable', 1, STATEMENT, 'type'], true);
      expect(query).toHaveBeenNthCalledWith(11, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('At least one variable symbol does not have a corresponding type hypothesis');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when a type hypothesis symbol is already typed', async (): Promise<void> => {
      preamble();
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ expressionId: EXPRESSION, type: 'type' });

      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(11, UNIQUE_VARIABLE_SYMBOL_TYPE, [STATEMENT, 'type', 1, EXPRESSION, 1], true);
      expect(query).toHaveBeenNthCalledWith(12, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Variable symbols in a statement can only be typed once');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when a type hypothesis expression is not paired with a variable', async (): Promise<void> => {
      preamble();
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ expressionId: EXPRESSION, type: 'type' });

      expect(query).toHaveBeenCalledTimes(10);
      expect(query).toHaveBeenNthCalledWith(9, VERIFY_EXPRESSION_TYPE, [EXPRESSION, 1, 'variable'], true);
      expect(query).toHaveBeenNthCalledWith(10, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Expression type is invalid');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when a type hypothesis expression exceeds the maximum length', async (): Promise<void> => {
      preamble();
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ expressionId: EXPRESSION, type: 'type' });

      expect(query).toHaveBeenCalledTimes(11);
      expect(query).toHaveBeenNthCalledWith(10, EXCEEDS_MAX_LENGTH, [EXPRESSION, 1], true);
      expect(query).toHaveBeenNthCalledWith(11, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Expression type is invalid');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the expression type verification fails', async (): Promise<void> => {
      preamble();
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(8, VERIFY_EXPRESSION_TYPE, [EXPRESSION, 0, 'constant'], true);
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying expression type failed');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the insert fails', async (): Promise<void> => {
      preamble();
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(11, INSERT_HYPOTHESIS, [SYSTEM, STATEMENT, EXPRESSION, 'logic'], true);
      expect(query).toHaveBeenNthCalledWith(12, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Create hypothesis failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the unique hypothesis expression check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(5, VERIFY_UNIQUE_HYPOTHESIS, [STATEMENT, EXPRESSION], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying unique expression failed');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the logic typed-symbols check fails', async (): Promise<void> => {
      preamble();
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(10);
      expect(query).toHaveBeenNthCalledWith(9, VARIABLE_SYMBOL_COUNT, [EXPRESSION, 'variable'], true);
      expect(query).toHaveBeenNthCalledWith(10, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying all symbols in expression are typed failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the type unique variable symbol check fails', async (): Promise<void> => {
      preamble();
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ expressionId: EXPRESSION, type: 'type' });

      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(11, UNIQUE_VARIABLE_SYMBOL_TYPE, [STATEMENT, 'type', 1, EXPRESSION, 1], true);
      expect(query).toHaveBeenNthCalledWith(12, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying unique variable symbol type failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the type is invalid', async (): Promise<void> => {
      const response = await gql({ expressionId: EXPRESSION, type: 'nonsense' });

      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('reports an error when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($systemId: String!, $statementId: String!, $hypothesisPayload: NewHypothesisPayload!) { createHypothesis(systemId: $systemId, statementId: $statementId, hypothesisPayload: $hypothesisPayload) { id } }',
        variables: { systemId: SYSTEM, statementId: STATEMENT, hypothesisPayload: { expressionId: EXPRESSION, type: 'logic' } }
      });

      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].message).toBe('Unauthorized');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST POST /system/:systemId/statement/:statementId/hypothesis', (): void => {
    it('creates a logic hypothesis', async (): Promise<void> => {
      preamble();
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: HYPOTHESIS }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ expressionId: EXPRESSION, type: 'logic' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(11, INSERT_HYPOTHESIS, [SYSTEM, STATEMENT, EXPRESSION, 'logic'], true);
      expect(query).toHaveBeenNthCalledWith(12, 'COMMIT');
      expect(response.body).toStrictEqual(created('logic'));
      expect(response.statusCode).toBe(HttpStatus.CREATED);
    });

    it('responds with 403 when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({ error: 'Forbidden', message: 'User does not own the resource', statusCode: HttpStatus.FORBIDDEN });
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('responds with 404 when the statement does not exist', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Statement not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 409 when the hypothesis expression is already used', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await rest({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(5);
      expect(response.body).toStrictEqual({ error: 'Conflict', message: 'The hypotheses in a statement should be unique', statusCode: HttpStatus.CONFLICT });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('responds with 422 when a logic hypothesis expression is not constant prefixed', async (): Promise<void> => {
      preamble();
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Unprocessable Entity', message: 'Expression type is invalid', statusCode: HttpStatus.UNPROCESSABLE_ENTITY });
      expect(response.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('responds with 400 when the system id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ expressionId: EXPRESSION, type: 'logic' }, { systemId: 'not-a-uuid' });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the payload has extra fields', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ expressionId: EXPRESSION, type: 'logic', extra: true });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: ['property extra should not exist'], statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 401 when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post(`/system/${SYSTEM}/statement/${STATEMENT}/hypothesis`).send({ expressionId: EXPRESSION, type: 'logic' });

      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
