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
const VERIFY_OWNERSHIP = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1) AND ("SystemEntity"."owner_user_id" = $2))) LIMIT 1';
const VERIFY_UNIQUE_SEQUENCE = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "expressions" "ExpressionEntity" WHERE (("ExpressionEntity"."system_id" = $1) AND ("ExpressionEntity"."canonical" = $2))) LIMIT 1';
const VERIFY_ALL_EXIST = 'SELECT COUNT(1) AS "cnt" FROM "symbols" "SymbolEntity" WHERE (("SymbolEntity"."id" IN ($1)) AND ("SymbolEntity"."system_id" = $2))';
const INSERT_EXPRESSION = 'INSERT INTO "expressions"("id", "system_id", "canonical") VALUES (DEFAULT, $1, $2) RETURNING "id"';
const TOKEN_PRELOAD = 'SELECT "ExpressionTokenEntity"."system_id" AS "ExpressionTokenEntity_system_id", "ExpressionTokenEntity"."symbol_id" AS "ExpressionTokenEntity_symbol_id", "ExpressionTokenEntity"."expression_id" AS "ExpressionTokenEntity_expression_id", "ExpressionTokenEntity"."position" AS "ExpressionTokenEntity_position" FROM "expression_tokens" "ExpressionTokenEntity" WHERE ((("ExpressionTokenEntity"."expression_id" = $1 AND "ExpressionTokenEntity"."position" = $2)))';
const INSERT_TOKEN = 'INSERT INTO "expression_tokens"("system_id", "symbol_id", "expression_id", "position") VALUES ($1, $2, $3, $4)';

describe('Create Expression', (): void => {
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

  const token = (): string => {
    return app.get(JwtService).sign({ userId: USER });
  };

  const gql = (expressionPayload: Record<string, unknown>, systemId: string = SYSTEM): request.Test => {
    return request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token()}`]).send({
      query: 'mutation ($systemId: String!, $expressionPayload: NewExpressionPayload!) { createExpression(systemId: $systemId, expressionPayload: $expressionPayload) { id systemId canonical } }',
      variables: { systemId, expressionPayload }
    });
  };

  const rest = (body: Record<string, unknown>, systemId: string = SYSTEM): request.Test => {
    return request(app.getHttpServer()).post(`/system/${systemId}/expression`).set('Cookie', [`token=${token()}`]).send(body);
  };

  const validPayload = (): Record<string, unknown> => {
    return { canonical: [SYMBOL] };
  };

  const created = (): Record<string, unknown> => {
    return { id: EXPRESSION, systemId: SYSTEM, canonical: [SYMBOL] };
  };

  const happyPath = (): void => {
    query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
    query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([{ id: EXPRESSION }]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation createExpression', (): void => {
    it('creates the expression', async (): Promise<void> => {
      happyPath();

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(10);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(query).toHaveBeenNthCalledWith(2, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_UNIQUE_SEQUENCE, [SYSTEM, [SYMBOL]], true);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_ALL_EXIST, [SYMBOL, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      expect(query).toHaveBeenNthCalledWith(7, INSERT_EXPRESSION, [SYSTEM, [SYMBOL]], true);
      expect(query).toHaveBeenNthCalledWith(8, TOKEN_PRELOAD, [EXPRESSION, 0], true);
      expect(query).toHaveBeenNthCalledWith(9, INSERT_TOKEN, [SYSTEM, SYMBOL, EXPRESSION, 0], true);
      expect(query).toHaveBeenNthCalledWith(10, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { createExpression: created() } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
      expect(response.body.errors[0].message).toBe('User does not own the resource');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the ownership check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying ownership failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the symbol sequence is taken', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_UNIQUE_SEQUENCE, [SYSTEM, [SYMBOL]], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Expressions in the same system must have a unique sequence of symbols');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.CONFLICT);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the sequence uniqueness check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying unique symbol sequence failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when a symbol does not exist', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_ALL_EXIST, [SYMBOL, SYSTEM], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Symbol not found');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the symbol verification fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying symbols failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the start transaction fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Creating expression failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the insert expression fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(7, INSERT_EXPRESSION, [SYSTEM, [SYMBOL]], true);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Creating expression failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the insert token fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: EXPRESSION }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(10);
      expect(query).toHaveBeenNthCalledWith(9, INSERT_TOKEN, [SYSTEM, SYMBOL, EXPRESSION, 0], true);
      expect(query).toHaveBeenNthCalledWith(10, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Creating expression failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the commit fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: EXPRESSION }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(11);
      expect(query).toHaveBeenNthCalledWith(10, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(11, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Creating expression failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the canonical contains a non-UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ canonical: ['not-a-uuid'] });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toStrictEqual(['each value in canonical must be a UUID']);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the payload has extra fields', async (): Promise<void> => {
      const response = await gql({ canonical: [SYMBOL], extra: true });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('reports an error when the system id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql(validPayload(), 'not-a-uuid');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Validation failed (uuid is expected)');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the session user is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(response.body.errors[0].message).toBe('Invalid token');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($systemId: String!, $expressionPayload: NewExpressionPayload!) { createExpression(systemId: $systemId, expressionPayload: $expressionPayload) { id systemId canonical } }',
        variables: { systemId: SYSTEM, expressionPayload: validPayload() }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].message).toBe('Unauthorized');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST POST /system/:systemId/expression', (): void => {
    it('creates the expression', async (): Promise<void> => {
      happyPath();

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(10);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(query).toHaveBeenNthCalledWith(2, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_UNIQUE_SEQUENCE, [SYSTEM, [SYMBOL]], true);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_ALL_EXIST, [SYMBOL, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      expect(query).toHaveBeenNthCalledWith(7, INSERT_EXPRESSION, [SYSTEM, [SYMBOL]], true);
      expect(query).toHaveBeenNthCalledWith(8, TOKEN_PRELOAD, [EXPRESSION, 0], true);
      expect(query).toHaveBeenNthCalledWith(9, INSERT_TOKEN, [SYSTEM, SYMBOL, EXPRESSION, 0], true);
      expect(query).toHaveBeenNthCalledWith(10, 'COMMIT');
      expect(response.body).toStrictEqual(created());
      expect(response.statusCode).toBe(HttpStatus.CREATED);
    });

    it('responds with 403 when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({ error: 'Forbidden', message: 'User does not own the resource', statusCode: HttpStatus.FORBIDDEN });
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('responds with 500 when the ownership check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockRejectedValueOnce(new Error());

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Verifying ownership failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 409 when the symbol sequence is taken', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({ error: 'Conflict', message: 'Expressions in the same system must have a unique sequence of symbols', statusCode: HttpStatus.CONFLICT });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('responds with 500 when the sequence uniqueness check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Verifying unique symbol sequence failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 404 when a symbol does not exist', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 0 }]));

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Symbol not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 500 when the symbol verification fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Verifying symbols failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the start transaction fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Creating expression failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the insert expression fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Creating expression failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the insert token fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: EXPRESSION }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(10);
      expect(query).toHaveBeenNthCalledWith(9, INSERT_TOKEN, [SYSTEM, SYMBOL, EXPRESSION, 0], true);
      expect(query).toHaveBeenNthCalledWith(10, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Creating expression failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the commit fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: EXPRESSION }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(11);
      expect(query).toHaveBeenNthCalledWith(10, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(11, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Creating expression failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the canonical contains a non-UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ canonical: ['not-a-uuid'] });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: ['each value in canonical must be a UUID'], statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the canonical is not an array', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ canonical: SYMBOL });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toContain('canonical must be an array');
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the payload has extra fields', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ canonical: [SYMBOL], extra: true });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: ['property extra should not exist'], statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the system id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest(validPayload(), 'not-a-uuid');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 401 when the session user is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(response.body).toStrictEqual({ error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the token cookie is not a JWT', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post(`/system/${SYSTEM}/expression`).set('Cookie', ['token=not-a-jwt']).send(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post(`/system/${SYSTEM}/expression`).send(validPayload());

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
