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
const NEW_EXPRESSION = 'c3d4e5f6-a7b8-499a-9abc-def012345678';
const GUARD_SELECT = 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1';
const SELECT_BY_ID = 'SELECT "StatementEntity"."id" AS "StatementEntity_id", "StatementEntity"."system_id" AS "StatementEntity_system_id", "StatementEntity"."assertion_expression_id" AS "StatementEntity_assertion_expression_id", "StatementEntity"."name" AS "StatementEntity_name", "StatementEntity"."description" AS "StatementEntity_description" FROM "statements" "StatementEntity" WHERE (("StatementEntity"."id" = $1) AND ("StatementEntity"."system_id" = $2)) LIMIT 1';
const VERIFY_OWNERSHIP = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1) AND ("SystemEntity"."owner_user_id" = $2))) LIMIT 1';
const VERIFY_UNIQUE_NAME = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "statements" "StatementEntity" WHERE (("StatementEntity"."system_id" = $1) AND ("StatementEntity"."name" = $2))) LIMIT 1';
const VERIFY_EXPRESSION_EXISTS = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "expressions" "ExpressionEntity" WHERE (("ExpressionEntity"."id" = $1) AND ("ExpressionEntity"."system_id" = $2))) LIMIT 1';
const VERIFY_EXPRESSION_TYPE = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "expression_tokens" "ExpressionTokenEntity" LEFT JOIN "symbols" "ExpressionTokenEntity__ExpressionTokenEntity_symbol" ON "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."system_id"="ExpressionTokenEntity"."system_id" AND "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."id"="ExpressionTokenEntity"."symbol_id" WHERE (("ExpressionTokenEntity"."expression_id" = $1) AND ("ExpressionTokenEntity"."position" = $2) AND ((("ExpressionTokenEntity__ExpressionTokenEntity_symbol"."type" = $3))))) LIMIT 1';
const VARIABLE_SYMBOL_COUNT = 'SELECT COUNT(DISTINCT("ExpressionTokenEntity"."expression_id", "ExpressionTokenEntity"."position")) AS "cnt" FROM "expression_tokens" "ExpressionTokenEntity" LEFT JOIN "symbols" "ExpressionTokenEntity__ExpressionTokenEntity_symbol" ON "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."system_id"="ExpressionTokenEntity"."system_id" AND "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."id"="ExpressionTokenEntity"."symbol_id" WHERE (("ExpressionTokenEntity"."expression_id" = $1) AND ((("ExpressionTokenEntity__ExpressionTokenEntity_symbol"."type" = $2))))';
const TYPED_SYMBOL_COUNT = 'SELECT COUNT(DISTINCT("ExpressionTokenEntity"."expression_id", "ExpressionTokenEntity"."position")) AS "cnt" FROM "expression_tokens" "ExpressionTokenEntity" LEFT JOIN "symbols" "ExpressionTokenEntity__ExpressionTokenEntity_symbol" ON "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."system_id"="ExpressionTokenEntity"."system_id" AND "ExpressionTokenEntity__ExpressionTokenEntity_symbol"."id"="ExpressionTokenEntity"."symbol_id"  LEFT JOIN "expression_tokens" "8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e" ON "8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."system_id"="ExpressionTokenEntity__ExpressionTokenEntity_symbol"."system_id" AND "8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."symbol_id"="ExpressionTokenEntity__ExpressionTokenEntity_symbol"."id"  LEFT JOIN "expressions" "8111f77118d533dd6c7d0fd4bacf7b7c3c1ed70c" ON "8111f77118d533dd6c7d0fd4bacf7b7c3c1ed70c"."system_id"="8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."system_id" AND "8111f77118d533dd6c7d0fd4bacf7b7c3c1ed70c"."id"="8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."expression_id"  LEFT JOIN "statement_hypotheses" "82600074aeee895e9f7db2a20e16218c6e85179c" ON "82600074aeee895e9f7db2a20e16218c6e85179c"."system_id"="8111f77118d533dd6c7d0fd4bacf7b7c3c1ed70c"."system_id" AND "82600074aeee895e9f7db2a20e16218c6e85179c"."expression_id"="8111f77118d533dd6c7d0fd4bacf7b7c3c1ed70c"."id" WHERE (("ExpressionTokenEntity"."expression_id" = $1) AND ((("ExpressionTokenEntity__ExpressionTokenEntity_symbol"."type" = $2) AND ((("8e9dfc97e5b949f87fba1bba7cdd914de4c74e8e"."position" = $3) AND (((((\"82600074aeee895e9f7db2a20e16218c6e85179c\".\"statement_id\" = $4) AND (\"82600074aeee895e9f7db2a20e16218c6e85179c\".\"type\" = $5))))))))))';
const STATEMENT_PRELOAD = 'SELECT "StatementEntity"."id" AS "StatementEntity_id", "StatementEntity"."system_id" AS "StatementEntity_system_id", "StatementEntity"."assertion_expression_id" AS "StatementEntity_assertion_expression_id", "StatementEntity"."name" AS "StatementEntity_name", "StatementEntity"."description" AS "StatementEntity_description" FROM "statements" "StatementEntity" WHERE "StatementEntity"."id" IN ($1)';
const UPDATE_NAME = 'UPDATE "statements" SET "name" = $1 WHERE "id" IN ($2)';
const UPDATE_ASSERTION = 'UPDATE "statements" SET "assertion_expression_id" = $1 WHERE "id" IN ($2)';

describe('Update Statement', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const guardUser = (): Record<string, unknown> => {
    return { UserEntity_id: USER, UserEntity_handle: 'Test1 User1', UserEntity_email: 'test1.user1@example.com', UserEntity_password_hash: hashSync('Test1User1!') };
  };

  const statementRow = (): Record<string, unknown> => {
    return { StatementEntity_id: STATEMENT, StatementEntity_system_id: SYSTEM, StatementEntity_assertion_expression_id: EXPRESSION, StatementEntity_name: 'TestStatement1', StatementEntity_description: 'Test Statement 1' };
  };

  const token = (): string => app.get(JwtService).sign({ userId: USER });

  const gql = (statementPayload: Record<string, unknown>, ids: { systemId?: string; statementId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token()}`]).send({
      query: 'mutation ($systemId: String!, $statementId: String!, $statementPayload: EditStatementPayload!) { updateStatement(systemId: $systemId, statementId: $statementId, statementPayload: $statementPayload) { id systemId assertionExpressionId name description } }',
      variables: { systemId: ids.systemId ?? SYSTEM, statementId: ids.statementId ?? STATEMENT, statementPayload }
    });
  };

  const rest = (body: Record<string, unknown>, ids: { systemId?: string; statementId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).patch(`/system/${ids.systemId ?? SYSTEM}/statement/${ids.statementId ?? STATEMENT}`).set('Cookie', [`token=${token()}`]).send(body);
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation updateStatement', (): void => {
    it('updates the statement name', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: STATEMENT }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ name: 'NewName' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(query).toHaveBeenNthCalledWith(2, SELECT_BY_ID, [STATEMENT, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_UNIQUE_NAME, [SYSTEM, 'NewName'], true);
      expect(query).toHaveBeenNthCalledWith(5, STATEMENT_PRELOAD, [STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(7, UPDATE_NAME, ['NewName', STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(8, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { updateStatement: { id: STATEMENT, systemId: SYSTEM, assertionExpressionId: EXPRESSION, name: 'NewName', description: 'Test Statement 1' } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('updates the statement assertion expression', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: STATEMENT }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ assertionExpressionId: NEW_EXPRESSION });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_EXPRESSION_EXISTS, [NEW_EXPRESSION, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      expect(query).toHaveBeenNthCalledWith(7, VERIFY_EXPRESSION_TYPE, [NEW_EXPRESSION, 0, 'constant'], true);
      expect(query).toHaveBeenNthCalledWith(8, VARIABLE_SYMBOL_COUNT, [NEW_EXPRESSION, 'variable'], true);
      expect(query).toHaveBeenNthCalledWith(9, TYPED_SYMBOL_COUNT, [NEW_EXPRESSION, 'variable', 1, STATEMENT, 'type'], true);
      expect(query).toHaveBeenNthCalledWith(10, STATEMENT_PRELOAD, [STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(11, UPDATE_ASSERTION, [NEW_EXPRESSION, STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(12, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { updateStatement: { id: STATEMENT, systemId: SYSTEM, assertionExpressionId: NEW_EXPRESSION, name: 'TestStatement1', description: 'Test Statement 1' } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('updates the statement description', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: STATEMENT }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ description: 'New description' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(4, STATEMENT_PRELOAD, [STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'UPDATE "statements" SET "description" = $1 WHERE "id" IN ($2)', ['New description', STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(7, 'COMMIT');
      expect(response.body.data.updateStatement.description).toBe('New description');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('saves without extra checks when nothing changes', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));

      const response = await gql({ name: 'TestStatement1' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(2, SELECT_BY_ID, [STATEMENT, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(4, STATEMENT_PRELOAD, [STATEMENT], true);
      expect(response.body.data.updateStatement.name).toBe('TestStatement1');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the statement is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ name: 'NewName' });

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Statement not found');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ name: 'NewName' });

      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body.errors[0].message).toBe('User does not own the resource');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the new name is taken', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await gql({ name: 'NewName' });

      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_UNIQUE_NAME, [SYSTEM, 'NewName'], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Statement in a system must have a unique name');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the new assertion expression does not exist', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ assertionExpressionId: NEW_EXPRESSION });

      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_EXPRESSION_EXISTS, [NEW_EXPRESSION, SYSTEM], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Expression not found');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the new assertion expression is not constant prefixed', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ assertionExpressionId: NEW_EXPRESSION });

      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(7, VERIFY_EXPRESSION_TYPE, [NEW_EXPRESSION, 0, 'constant'], true);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Expression type is invalid');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the save fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ name: 'NewName' });

      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(7, UPDATE_NAME, ['NewName', STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Updating statement failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the name exceeds its maximum length', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ name: 'a'.repeat(201) });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toStrictEqual(['name must be shorter than or equal to 200 characters']);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($systemId: String!, $statementId: String!, $statementPayload: EditStatementPayload!) { updateStatement(systemId: $systemId, statementId: $statementId, statementPayload: $statementPayload) { id } }',
        variables: { systemId: SYSTEM, statementId: STATEMENT, statementPayload: { name: 'NewName' } }
      });

      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].message).toBe('Unauthorized');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST PATCH /system/:systemId/statement/:statementId', (): void => {
    it('updates the statement name', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: STATEMENT }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ name: 'NewName' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(7, UPDATE_NAME, ['NewName', STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(8, 'COMMIT');
      expect(response.body).toStrictEqual({ id: STATEMENT, systemId: SYSTEM, assertionExpressionId: EXPRESSION, name: 'NewName', description: 'Test Statement 1' });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when the statement is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ name: 'NewName' });

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Statement not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 403 when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ name: 'NewName' });

      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({ error: 'Forbidden', message: 'User does not own the resource', statusCode: HttpStatus.FORBIDDEN });
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('responds with 409 when the new name is taken', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await rest({ name: 'NewName' });

      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body).toStrictEqual({ error: 'Conflict', message: 'Statement in a system must have a unique name', statusCode: HttpStatus.CONFLICT });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('responds with 422 when the new assertion expression is not constant prefixed', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ assertionExpressionId: NEW_EXPRESSION });

      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Unprocessable Entity', message: 'Expression type is invalid', statusCode: HttpStatus.UNPROCESSABLE_ENTITY });
      expect(response.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('responds with 400 when the system id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ name: 'NewName' }, { systemId: 'not-a-uuid' });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the payload has extra fields', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ name: 'NewName', extra: true });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: ['property extra should not exist'], statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 401 when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).patch(`/system/${SYSTEM}/statement/${STATEMENT}`).send({ name: 'NewName' });

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
