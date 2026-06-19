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
const EXPRESSION = 'b2c3d4e5-f6a7-4889-9abc-def012345678';
const GUARD_SELECT = 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1';
const VERIFY_OWNERSHIP = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1) AND ("SystemEntity"."owner_user_id" = $2))) LIMIT 1';
const VERIFY_UNIQUE_NAME = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "statements" "StatementEntity" WHERE (("StatementEntity"."system_id" = $1) AND ("StatementEntity"."name" = $2))) LIMIT 1';
const VERIFY_EXPRESSION_EXISTS = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "expressions" "ExpressionEntity" WHERE (("ExpressionEntity"."id" = $1) AND ("ExpressionEntity"."system_id" = $2))) LIMIT 1';
const VERIFY_EXPRESSION_TYPE = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "expression_tokens" "ExpressionTokenEntity" LEFT JOIN "symbols" "ExpressionTokenEntity__ExpressionTokenEntity_symbol" ON "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."system_id"="ExpressionTokenEntity"."system_id" AND "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."id"="ExpressionTokenEntity"."symbol_id" WHERE (("ExpressionTokenEntity"."expression_id" = $1) AND ("ExpressionTokenEntity"."position" = $2) AND ((("ExpressionTokenEntity__ExpressionTokenEntity_symbol"."type" = $3))))) LIMIT 1';
const UNIQUE_VARIABLE_SYMBOL_TYPE = 'SELECT COUNT(DISTINCT("SymbolEntity"."id")) AS "cnt" FROM "symbols" "SymbolEntity" LEFT JOIN "expression_tokens" "SymbolEntity__SymbolEntity_expressionTokens" ON "SymbolEntity__SymbolEntity_expressionTokens"."system_id"="SymbolEntity"."system_id" AND "SymbolEntity__SymbolEntity_expressionTokens"."symbol_id"="SymbolEntity"."id" WHERE ((((0=1) AND ("SymbolEntity__SymbolEntity_expressionTokens"."position" = $1))))';
const VARIABLE_SYMBOL_COUNT = 'SELECT COUNT(DISTINCT("ExpressionTokenEntity"."expression_id", "ExpressionTokenEntity"."position")) AS "cnt" FROM "expression_tokens" "ExpressionTokenEntity" LEFT JOIN "symbols" "ExpressionTokenEntity__ExpressionTokenEntity_symbol" ON "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."system_id"="ExpressionTokenEntity"."system_id" AND "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."id"="ExpressionTokenEntity"."symbol_id" WHERE (("ExpressionTokenEntity"."expression_id" = $1) AND ((("ExpressionTokenEntity__ExpressionTokenEntity_symbol"."type" = $2))))';
const TYPED_SYMBOL_COUNT = 'SELECT COUNT(DISTINCT("ExpressionTokenEntity"."expression_id", "ExpressionTokenEntity"."position")) AS "cnt" FROM "expression_tokens" "ExpressionTokenEntity" LEFT JOIN "symbols" "ExpressionTokenEntity__ExpressionTokenEntity_symbol" ON "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."system_id"="ExpressionTokenEntity"."system_id" AND "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."id"="ExpressionTokenEntity"."symbol_id"  LEFT JOIN "expression_tokens" "8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e" ON "8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."system_id"="ExpressionTokenEntity__ExpressionTokenEntity_symbol"."system_id" AND "8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."symbol_id"="ExpressionTokenEntity__ExpressionTokenEntity_symbol"."id" WHERE (("ExpressionTokenEntity"."expression_id" = $1) AND ((("ExpressionTokenEntity__ExpressionTokenEntity_symbol"."type" = $2) AND (((0=1) AND ("8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."position" = $3))))))';
const INSERT_STATEMENT = 'INSERT INTO "statements"("id", "system_id", "assertion_expression_id", "name", "description") VALUES (DEFAULT, $1, $2, $3, $4) RETURNING "id"';
const TYPEHYP = 'c3d4e5f6-a7b8-499a-9abc-def012345678';
const UNIQUE_VARIABLE_SYMBOL_TYPE_PROPOSED = 'SELECT COUNT(DISTINCT("SymbolEntity"."id")) AS "cnt" FROM "symbols" "SymbolEntity" LEFT JOIN "expression_tokens" "SymbolEntity__SymbolEntity_expressionTokens" ON "SymbolEntity__SymbolEntity_expressionTokens"."system_id"="SymbolEntity"."system_id" AND "SymbolEntity__SymbolEntity_expressionTokens"."symbol_id"="SymbolEntity"."id" WHERE (((("SymbolEntity__SymbolEntity_expressionTokens"."expression_id" IN ($1)) AND ("SymbolEntity__SymbolEntity_expressionTokens"."position" = $2))))';
const TYPED_SYMBOL_COUNT_PROPOSED = 'SELECT COUNT(DISTINCT("ExpressionTokenEntity"."expression_id", "ExpressionTokenEntity"."position")) AS "cnt" FROM "expression_tokens" "ExpressionTokenEntity" LEFT JOIN "symbols" "ExpressionTokenEntity__ExpressionTokenEntity_symbol" ON "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."system_id"="ExpressionTokenEntity"."system_id" AND "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."id"="ExpressionTokenEntity"."symbol_id"  LEFT JOIN "expression_tokens" "8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e" ON "8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."system_id"="ExpressionTokenEntity__ExpressionTokenEntity_symbol"."system_id" AND "8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."symbol_id"="ExpressionTokenEntity__ExpressionTokenEntity_symbol"."id" WHERE (("ExpressionTokenEntity"."expression_id" = $1) AND ((("ExpressionTokenEntity__ExpressionTokenEntity_symbol"."type" = $2) AND ((("8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."expression_id" IN ($3)) AND ("8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."position" = $4))))))';
const INSERT_HYPOTHESIS = 'INSERT INTO "statement_hypotheses"("id", "system_id", "statement_id", "expression_id", "type") VALUES (DEFAULT, $1, $2, $3, $4) RETURNING "id"';
const EXCEEDS_MAX_LENGTH = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "expression_tokens" "ExpressionTokenEntity" WHERE (("ExpressionTokenEntity"."expression_id" = $1) AND ("ExpressionTokenEntity"."position" > $2))) LIMIT 1';

describe('Create Statement', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const guardUser = (): Record<string, unknown> => {
    return { UserEntity_id: USER, UserEntity_handle: 'Test1 User1', UserEntity_email: 'test1.user1@example.com', UserEntity_password_hash: hashSync('Test1User1!') };
  };

  const token = (): string => app.get(JwtService).sign({ userId: USER });

  const gql = (statementPayload: Record<string, unknown>, systemId: string = SYSTEM): request.Test => {
    return request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token()}`]).send({
      query: 'mutation ($systemId: String!, $statementPayload: NewStatementPayload!) { createStatement(systemId: $systemId, statementPayload: $statementPayload) { id systemId assertionExpressionId name description } }',
      variables: { systemId, statementPayload }
    });
  };

  const rest = (body: Record<string, unknown>, systemId: string = SYSTEM): request.Test => {
    return request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [`token=${token()}`]).send(body);
  };

  const validPayload = (): Record<string, unknown> => {
    return { name: 'TestStatement1', description: 'Test Statement 1', assertionExpressionId: EXPRESSION, typeHypothesesExpressionIds: [] };
  };

  const created = (): Record<string, unknown> => {
    return { id: STATEMENT, systemId: SYSTEM, assertionExpressionId: EXPRESSION, name: 'TestStatement1', description: 'Test Statement 1' };
  };

  const happyPath = (): void => {
    query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
    query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
    query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
    query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
    query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
    query.mockResolvedValueOnce(buildQueryResult([{ id: STATEMENT }]));
    query.mockResolvedValueOnce(buildQueryResult([]));
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation createStatement', (): void => {
    it('creates the statement', async (): Promise<void> => {
      happyPath();

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(query).toHaveBeenNthCalledWith(2, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_UNIQUE_NAME, [SYSTEM, 'TestStatement1'], true);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_EXPRESSION_EXISTS, [EXPRESSION, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      expect(query).toHaveBeenNthCalledWith(7, VERIFY_EXPRESSION_TYPE, [EXPRESSION, 0, 'constant'], true);
      expect(query).toHaveBeenNthCalledWith(8, UNIQUE_VARIABLE_SYMBOL_TYPE, [1], true);
      expect(query).toHaveBeenNthCalledWith(9, VARIABLE_SYMBOL_COUNT, [EXPRESSION, 'variable'], true);
      expect(query).toHaveBeenNthCalledWith(10, TYPED_SYMBOL_COUNT, [EXPRESSION, 'variable', 1], true);
      expect(query).toHaveBeenNthCalledWith(11, INSERT_STATEMENT, [SYSTEM, EXPRESSION, 'TestStatement1', 'Test Statement 1'], true);
      expect(query).toHaveBeenNthCalledWith(12, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { createStatement: created() } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('creates the statement with type hypotheses', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: STATEMENT }]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: 'd4e5f6a7-b8c9-4aab-9abc-def012345678' }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ name: 'TestStatement1', description: 'Test Statement 1', assertionExpressionId: EXPRESSION, typeHypothesesExpressionIds: [TYPEHYP] });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(17);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_EXPRESSION_EXISTS, [EXPRESSION, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(5, VERIFY_EXPRESSION_EXISTS, [TYPEHYP, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(8, VERIFY_EXPRESSION_TYPE, [EXPRESSION, 0, 'constant'], true);
      expect(query).toHaveBeenNthCalledWith(9, VERIFY_EXPRESSION_TYPE, [TYPEHYP, 0, 'constant'], true);
      expect(query).toHaveBeenNthCalledWith(10, VERIFY_EXPRESSION_TYPE, [TYPEHYP, 1, 'variable'], true);
      expect(query).toHaveBeenNthCalledWith(11, EXCEEDS_MAX_LENGTH, [TYPEHYP, 1], true);
      expect(query).toHaveBeenNthCalledWith(12, UNIQUE_VARIABLE_SYMBOL_TYPE_PROPOSED, [TYPEHYP, 1], true);
      expect(query).toHaveBeenNthCalledWith(13, VARIABLE_SYMBOL_COUNT, [EXPRESSION, 'variable'], true);
      expect(query).toHaveBeenNthCalledWith(14, TYPED_SYMBOL_COUNT_PROPOSED, [EXPRESSION, 'variable', TYPEHYP, 1], true);
      expect(query).toHaveBeenNthCalledWith(15, INSERT_STATEMENT, [SYSTEM, EXPRESSION, 'TestStatement1', 'Test Statement 1'], true);
      expect(query).toHaveBeenNthCalledWith(16, INSERT_HYPOTHESIS, [SYSTEM, STATEMENT, TYPEHYP, 'type'], true);
      expect(query).toHaveBeenNthCalledWith(17, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { createStatement: created() } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
      expect(response.body.errors[0].message).toBe('User does not own the resource');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the name is taken', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_UNIQUE_NAME, [SYSTEM, 'TestStatement1'], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Statement in a system must have a unique name');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.CONFLICT);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the asserted expression does not exist', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_EXPRESSION_EXISTS, [EXPRESSION, SYSTEM], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Expression not found');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the assertion existence check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_EXPRESSION_EXISTS, [EXPRESSION, SYSTEM], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying expression existence failed');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the asserted expression is not constant prefixed', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(7, VERIFY_EXPRESSION_TYPE, [EXPRESSION, 0, 'constant'], true);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Expression type is invalid');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when a proposed type symbol is typed more than once', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(8, UNIQUE_VARIABLE_SYMBOL_TYPE, [1], true);
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Variable symbols in a statement can only be typed once');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.CONFLICT);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when not all assertion variable symbols are typed', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(11);
      expect(query).toHaveBeenNthCalledWith(9, VARIABLE_SYMBOL_COUNT, [EXPRESSION, 'variable'], true);
      expect(query).toHaveBeenNthCalledWith(10, TYPED_SYMBOL_COUNT, [EXPRESSION, 'variable', 1], true);
      expect(query).toHaveBeenNthCalledWith(11, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('At least one variable symbol does not have a corresponding type hypothesis');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the unique name check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_UNIQUE_NAME, [SYSTEM, 'TestStatement1'], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying statement unique name failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the unique variable symbol type check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(8, UNIQUE_VARIABLE_SYMBOL_TYPE, [1], true);
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying unique variable symbol type failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the typed-symbols check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(10);
      expect(query).toHaveBeenNthCalledWith(9, VARIABLE_SYMBOL_COUNT, [EXPRESSION, 'variable'], true);
      expect(query).toHaveBeenNthCalledWith(10, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying all symbols in expression are typed failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the insert fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(11, INSERT_STATEMENT, [SYSTEM, EXPRESSION, 'TestStatement1', 'Test Statement 1'], true);
      expect(query).toHaveBeenNthCalledWith(12, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Creating statement failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the commit fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: STATEMENT }]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(13);
      expect(query).toHaveBeenNthCalledWith(12, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(13, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Creating statement failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when required fields are blank', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ name: '', description: '', assertionExpressionId: EXPRESSION, typeHypothesesExpressionIds: [] });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toStrictEqual(['name should not be empty', 'description should not be empty']);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the payload has extra fields', async (): Promise<void> => {
      const response = await gql({ ...validPayload(), extra: true });

      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('reports an error when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($systemId: String!, $statementPayload: NewStatementPayload!) { createStatement(systemId: $systemId, statementPayload: $statementPayload) { id } }',
        variables: { systemId: SYSTEM, statementPayload: validPayload() }
      });

      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].message).toBe('Unauthorized');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST POST /system/:systemId/statement', (): void => {
    it('creates the statement', async (): Promise<void> => {
      happyPath();

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(7, VERIFY_EXPRESSION_TYPE, [EXPRESSION, 0, 'constant'], true);
      expect(query).toHaveBeenNthCalledWith(11, INSERT_STATEMENT, [SYSTEM, EXPRESSION, 'TestStatement1', 'Test Statement 1'], true);
      expect(query).toHaveBeenNthCalledWith(12, 'COMMIT');
      expect(response.body).toStrictEqual(created());
      expect(response.statusCode).toBe(HttpStatus.CREATED);
    });

    it('responds with 403 when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({ error: 'Forbidden', message: 'User does not own the resource', statusCode: HttpStatus.FORBIDDEN });
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('responds with 409 when the name is taken', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await rest(validPayload());

      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({ error: 'Conflict', message: 'Statement in a system must have a unique name', statusCode: HttpStatus.CONFLICT });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('responds with 404 when the asserted expression does not exist', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Expression not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 422 when the asserted expression is not constant prefixed', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Unprocessable Entity', message: 'Expression type is invalid', statusCode: HttpStatus.UNPROCESSABLE_ENTITY });
      expect(response.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('responds with 400 when the system id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest(validPayload(), 'not-a-uuid');

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the payload has extra fields', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ ...validPayload(), extra: true });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: ['property extra should not exist'], statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 401 when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post(`/system/${SYSTEM}/statement`).send(validPayload());

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
