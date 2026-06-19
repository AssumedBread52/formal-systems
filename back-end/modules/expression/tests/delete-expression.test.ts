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
const EXPRESSION = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const SYMBOL = 'b2c3d4e5-f6a7-4889-9abc-def012345678';
const GUARD_SELECT = 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1';
const SELECT_BY_ID = 'SELECT "ExpressionEntity"."id" AS "ExpressionEntity_id", "ExpressionEntity"."system_id" AS "ExpressionEntity_system_id", "ExpressionEntity"."canonical" AS "ExpressionEntity_canonical" FROM "expressions" "ExpressionEntity" WHERE (("ExpressionEntity"."id" = $1) AND ("ExpressionEntity"."system_id" = $2)) LIMIT 1';
const VERIFY_OWNERSHIP = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1) AND ("SystemEntity"."owner_user_id" = $2))) LIMIT 1';
const VERIFY_NOT_IN_USE = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "expressions" "ExpressionEntity" LEFT JOIN "statements" "ExpressionEntity__ExpressionEntity_statements" ON "ExpressionEntity__ExpressionEntity_statements"."system_id"="ExpressionEntity"."system_id" AND "ExpressionEntity__ExpressionEntity_statements"."assertion_expression_id"="ExpressionEntity"."id"  LEFT JOIN "statement_hypotheses" "ExpressionEntity__ExpressionEntity_hypotheses" ON "ExpressionEntity__ExpressionEntity_hypotheses"."system_id"="ExpressionEntity"."system_id" AND "ExpressionEntity__ExpressionEntity_hypotheses"."expression_id"="ExpressionEntity"."id" WHERE (((("ExpressionEntity"."id" = $1) AND (((NOT("ExpressionEntity__ExpressionEntity_statements"."id" IS NULL)))))) OR ((("ExpressionEntity"."id" = $2) AND (((NOT("ExpressionEntity__ExpressionEntity_hypotheses"."id" IS NULL)))))))) LIMIT 1';
const TOKEN_FIND = 'SELECT "ExpressionTokenEntity"."system_id" AS "ExpressionTokenEntity_system_id", "ExpressionTokenEntity"."symbol_id" AS "ExpressionTokenEntity_symbol_id", "ExpressionTokenEntity"."expression_id" AS "ExpressionTokenEntity_expression_id", "ExpressionTokenEntity"."position" AS "ExpressionTokenEntity_position" FROM "expression_tokens" "ExpressionTokenEntity" WHERE (("ExpressionTokenEntity"."system_id" = $1) AND ("ExpressionTokenEntity"."expression_id" = $2))';
const TOKEN_PRELOAD = 'SELECT "ExpressionTokenEntity"."system_id" AS "ExpressionTokenEntity_system_id", "ExpressionTokenEntity"."symbol_id" AS "ExpressionTokenEntity_symbol_id", "ExpressionTokenEntity"."expression_id" AS "ExpressionTokenEntity_expression_id", "ExpressionTokenEntity"."position" AS "ExpressionTokenEntity_position" FROM "expression_tokens" "ExpressionTokenEntity" WHERE ((("ExpressionTokenEntity"."expression_id" = $1 AND "ExpressionTokenEntity"."position" = $2)))';
const TOKEN_DELETE = 'DELETE FROM "expression_tokens" WHERE ("expression_id" = $1 AND "position" = $2)';
const EXPRESSION_PRELOAD = 'SELECT "ExpressionEntity"."id" AS "ExpressionEntity_id", "ExpressionEntity"."system_id" AS "ExpressionEntity_system_id", "ExpressionEntity"."canonical" AS "ExpressionEntity_canonical" FROM "expressions" "ExpressionEntity" WHERE "ExpressionEntity"."id" IN ($1)';
const EXPRESSION_DELETE = 'DELETE FROM "expressions" WHERE "id" = $1';

describe('Delete Expression', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const guardUser = (): Record<string, unknown> => {
    return {
      UserEntity_id: USER,
      UserEntity_handle: 'Test1 User1',
      UserEntity_email: 'test1.user1@example.com',
      UserEntity_password_hash: hashSync('Test1User1!')
    };
  };

  const expressionRow = (): Record<string, unknown> => {
    return {
      ExpressionEntity_id: EXPRESSION,
      ExpressionEntity_system_id: SYSTEM,
      ExpressionEntity_canonical: [SYMBOL]
    };
  };

  const tokenRow = (): Record<string, unknown> => {
    return {
      ExpressionTokenEntity_system_id: SYSTEM,
      ExpressionTokenEntity_symbol_id: SYMBOL,
      ExpressionTokenEntity_expression_id: EXPRESSION,
      ExpressionTokenEntity_position: 0
    };
  };

  const removed = (): Record<string, unknown> => {
    return { id: EXPRESSION, systemId: SYSTEM, canonical: [SYMBOL] };
  };

  const token = (): string => {
    return app.get(JwtService).sign({ userId: USER });
  };

  const gql = (ids: { systemId?: string; expressionId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token()}`]).send({
      query: 'mutation ($systemId: String!, $expressionId: String!) { deleteExpression(systemId: $systemId, expressionId: $expressionId) { id systemId canonical } }',
      variables: { systemId: ids.systemId ?? SYSTEM, expressionId: ids.expressionId ?? EXPRESSION }
    });
  };

  const rest = (ids: { systemId?: string; expressionId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).delete(`/system/${ids.systemId ?? SYSTEM}/expression/${ids.expressionId ?? EXPRESSION}`).set('Cookie', [`token=${token()}`]);
  };

  const happyPath = (): void => {
    query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
    query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
    query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
    query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation deleteExpression', (): void => {
    it('deletes the expression', async (): Promise<void> => {
      happyPath();

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(query).toHaveBeenNthCalledWith(2, SELECT_BY_ID, [EXPRESSION, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_NOT_IN_USE, [EXPRESSION, EXPRESSION], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      expect(query).toHaveBeenNthCalledWith(7, TOKEN_FIND, [SYSTEM, EXPRESSION], true);
      expect(query).toHaveBeenNthCalledWith(8, TOKEN_PRELOAD, [EXPRESSION, 0], true);
      expect(query).toHaveBeenNthCalledWith(9, TOKEN_DELETE, [EXPRESSION, 0], true);
      expect(query).toHaveBeenNthCalledWith(10, EXPRESSION_PRELOAD, [EXPRESSION], true);
      expect(query).toHaveBeenNthCalledWith(11, EXPRESSION_DELETE, [EXPRESSION], true);
      expect(query).toHaveBeenNthCalledWith(12, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { deleteExpression: removed() } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the expression is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Expression not found');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
      expect(response.body.errors[0].message).toBe('User does not own the resource');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the ownership check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying ownership failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the expression is in use', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_NOT_IN_USE, [EXPRESSION, EXPRESSION], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Expression is in use');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.CONFLICT);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the in-use check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying expression not in use failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the start transaction fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting expression failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when finding the tokens fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(7, TOKEN_FIND, [SYSTEM, EXPRESSION], true);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting expression failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when deleting the tokens fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(10);
      expect(query).toHaveBeenNthCalledWith(9, TOKEN_DELETE, [EXPRESSION, 0], true);
      expect(query).toHaveBeenNthCalledWith(10, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting expression failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when deleting the expression fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(11, EXPRESSION_DELETE, [EXPRESSION], true);
      expect(query).toHaveBeenNthCalledWith(12, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting expression failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the commit fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(13);
      expect(query).toHaveBeenNthCalledWith(12, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(13, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting expression failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the system id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ systemId: 'not-a-uuid' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Validation failed (uuid is expected)');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the expression id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ expressionId: 'not-a-uuid' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Validation failed (uuid is expected)');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the session user is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].message).toBe('Invalid token');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($systemId: String!, $expressionId: String!) { deleteExpression(systemId: $systemId, expressionId: $expressionId) { id systemId canonical } }',
        variables: { systemId: SYSTEM, expressionId: EXPRESSION }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].message).toBe('Unauthorized');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST DELETE /system/:systemId/expression/:expressionId', (): void => {
    it('deletes the expression', async (): Promise<void> => {
      happyPath();

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(7, TOKEN_FIND, [SYSTEM, EXPRESSION], true);
      expect(query).toHaveBeenNthCalledWith(9, TOKEN_DELETE, [EXPRESSION, 0], true);
      expect(query).toHaveBeenNthCalledWith(11, EXPRESSION_DELETE, [EXPRESSION], true);
      expect(query).toHaveBeenNthCalledWith(12, 'COMMIT');
      expect(response.body).toStrictEqual(removed());
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when the expression is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Expression not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 403 when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({ error: 'Forbidden', message: 'User does not own the resource', statusCode: HttpStatus.FORBIDDEN });
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('responds with 500 when the ownership check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Verifying ownership failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 409 when the expression is in use', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body).toStrictEqual({ error: 'Conflict', message: 'Expression is in use', statusCode: HttpStatus.CONFLICT });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('responds with 500 when the in-use check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Verifying expression not in use failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the start transaction fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Deleting expression failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when deleting the expression fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(11, EXPRESSION_DELETE, [EXPRESSION], true);
      expect(query).toHaveBeenNthCalledWith(12, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Deleting expression failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the commit fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(13);
      expect(query).toHaveBeenNthCalledWith(13, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Deleting expression failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
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

    it('responds with 400 when the expression id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ expressionId: 'not-a-uuid' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 401 when the session user is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the token cookie is not a JWT', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).delete(`/system/${SYSTEM}/expression/${EXPRESSION}`).set('Cookie', ['token=not-a-jwt']);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).delete(`/system/${SYSTEM}/expression/${EXPRESSION}`);

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
