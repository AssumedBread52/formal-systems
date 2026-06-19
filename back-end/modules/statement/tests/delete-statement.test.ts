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
const SELECT_BY_ID = 'SELECT "StatementEntity"."id" AS "StatementEntity_id", "StatementEntity"."system_id" AS "StatementEntity_system_id", "StatementEntity"."assertion_expression_id" AS "StatementEntity_assertion_expression_id", "StatementEntity"."name" AS "StatementEntity_name", "StatementEntity"."description" AS "StatementEntity_description" FROM "statements" "StatementEntity" WHERE (("StatementEntity"."id" = $1) AND ("StatementEntity"."system_id" = $2)) LIMIT 1';
const VERIFY_OWNERSHIP = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1) AND ("SystemEntity"."owner_user_id" = $2))) LIMIT 1';
const HYP_FIND = 'SELECT "HypothesisEntity"."id" AS "HypothesisEntity_id", "HypothesisEntity"."system_id" AS "HypothesisEntity_system_id", "HypothesisEntity"."statement_id" AS "HypothesisEntity_statement_id", "HypothesisEntity"."expression_id" AS "HypothesisEntity_expression_id", "HypothesisEntity"."type" AS "HypothesisEntity_type" FROM "statement_hypotheses" "HypothesisEntity" WHERE (("HypothesisEntity"."system_id" = $1) AND ("HypothesisEntity"."statement_id" = $2))';
const DVP_FIND = 'SELECT "DistinctVariablePairEntity"."system_id" AS "DistinctVariablePairEntity_system_id", "DistinctVariablePairEntity"."statement_id" AS "DistinctVariablePairEntity_statement_id", "DistinctVariablePairEntity"."variable_symbol_1_id" AS "DistinctVariablePairEntity_variable_symbol_1_id", "DistinctVariablePairEntity"."variable_symbol_2_id" AS "DistinctVariablePairEntity_variable_symbol_2_id" FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity" WHERE (("DistinctVariablePairEntity"."system_id" = $1) AND ("DistinctVariablePairEntity"."statement_id" = $2))';
const STATEMENT_PRELOAD = 'SELECT "StatementEntity"."id" AS "StatementEntity_id", "StatementEntity"."system_id" AS "StatementEntity_system_id", "StatementEntity"."assertion_expression_id" AS "StatementEntity_assertion_expression_id", "StatementEntity"."name" AS "StatementEntity_name", "StatementEntity"."description" AS "StatementEntity_description" FROM "statements" "StatementEntity" WHERE "StatementEntity"."id" IN ($1)';
const STATEMENT_DELETE = 'DELETE FROM "statements" WHERE "id" = $1';

describe('Delete Statement', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const guardUser = (): Record<string, unknown> => {
    return { UserEntity_id: USER, UserEntity_handle: 'Test1 User1', UserEntity_email: 'test1.user1@example.com', UserEntity_password_hash: hashSync('Test1User1!') };
  };

  const statementRow = (): Record<string, unknown> => {
    return { StatementEntity_id: STATEMENT, StatementEntity_system_id: SYSTEM, StatementEntity_assertion_expression_id: EXPRESSION, StatementEntity_name: 'TestStatement1', StatementEntity_description: 'Test Statement 1' };
  };

  const removed = (): Record<string, unknown> => {
    return { id: STATEMENT, systemId: SYSTEM, assertionExpressionId: EXPRESSION, name: 'TestStatement1', description: 'Test Statement 1' };
  };

  const token = (): string => app.get(JwtService).sign({ userId: USER });

  const gql = (ids: { systemId?: string; statementId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token()}`]).send({
      query: 'mutation ($systemId: String!, $statementId: String!) { deleteStatement(systemId: $systemId, statementId: $statementId) { id systemId assertionExpressionId name description } }',
      variables: { systemId: ids.systemId ?? SYSTEM, statementId: ids.statementId ?? STATEMENT }
    });
  };

  const rest = (ids: { systemId?: string; statementId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).delete(`/system/${ids.systemId ?? SYSTEM}/statement/${ids.statementId ?? STATEMENT}`).set('Cookie', [`token=${token()}`]);
  };

  const happyPath = (): void => {
    query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
    query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
    query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation deleteStatement', (): void => {
    it('deletes the statement', async (): Promise<void> => {
      happyPath();

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(10);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(query).toHaveBeenNthCalledWith(2, SELECT_BY_ID, [STATEMENT, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(4, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(5, 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      expect(query).toHaveBeenNthCalledWith(6, HYP_FIND, [SYSTEM, STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(7, DVP_FIND, [SYSTEM, STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(8, STATEMENT_PRELOAD, [STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(9, STATEMENT_DELETE, [STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(10, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { deleteStatement: removed() } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the statement is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Statement not found');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
      expect(response.body.errors[0].message).toBe('User does not own the resource');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the start transaction fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(4, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(5, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting statement failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when deleting the statement fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(10);
      expect(query).toHaveBeenNthCalledWith(9, STATEMENT_DELETE, [STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(10, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting statement failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the commit fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(11);
      expect(query).toHaveBeenNthCalledWith(10, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(11, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting statement failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the statement id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ statementId: 'not-a-uuid' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Validation failed (uuid is expected)');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($systemId: String!, $statementId: String!) { deleteStatement(systemId: $systemId, statementId: $statementId) { id systemId assertionExpressionId name description } }',
        variables: { systemId: SYSTEM, statementId: STATEMENT }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].message).toBe('Unauthorized');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST DELETE /system/:systemId/statement/:statementId', (): void => {
    it('deletes the statement', async (): Promise<void> => {
      happyPath();

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(10);
      expect(query).toHaveBeenNthCalledWith(6, HYP_FIND, [SYSTEM, STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(7, DVP_FIND, [SYSTEM, STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(9, STATEMENT_DELETE, [STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(10, 'COMMIT');
      expect(response.body).toStrictEqual(removed());
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when the statement is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Statement not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 403 when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({ error: 'Forbidden', message: 'User does not own the resource', statusCode: HttpStatus.FORBIDDEN });
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('responds with 500 when deleting the statement fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(10);
      expect(query).toHaveBeenNthCalledWith(10, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Deleting statement failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the system id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ systemId: 'not-a-uuid' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 401 when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).delete(`/system/${SYSTEM}/statement/${STATEMENT}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
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
