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
const SYMBOL = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const GUARD_SELECT = 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1';
const SELECT_BY_ID = 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE (("SymbolEntity"."id" = $1) AND ("SymbolEntity"."system_id" = $2)) LIMIT 1';
const VERIFY_OWNERSHIP = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1) AND ("SystemEntity"."owner_user_id" = $2))) LIMIT 1';
const VERIFY_NOT_IN_USE = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "symbols" "SymbolEntity" LEFT JOIN "expression_tokens" "SymbolEntity__SymbolEntity_expressionTokens" ON "SymbolEntity__SymbolEntity_expressionTokens"."system_id"="SymbolEntity"."system_id" AND "SymbolEntity__SymbolEntity_expressionTokens"."symbol_id"="SymbolEntity"."id" WHERE (("SymbolEntity"."id" = $1) AND (((NOT("SymbolEntity__SymbolEntity_expressionTokens"."symbol_id" IS NULL)))))) LIMIT 1';
const PRELOAD = 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE "SymbolEntity"."id" IN ($1)';
const DELETE = 'DELETE FROM "symbols" WHERE "id" = $1';

describe('Delete Symbol', (): void => {
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

  const symbolRow = (): Record<string, unknown> => {
    return {
      SymbolEntity_id: SYMBOL,
      SymbolEntity_system_id: SYSTEM,
      SymbolEntity_name: 'TestSymbol1',
      SymbolEntity_description: 'Test Symbol 1',
      SymbolEntity_type: 'constant',
      SymbolEntity_content: 'A'
    };
  };

  const removed = (): Record<string, unknown> => {
    return {
      id: SYMBOL,
      systemId: SYSTEM,
      name: 'TestSymbol1',
      description: 'Test Symbol 1',
      type: 'constant',
      content: 'A'
    };
  };

  const token = (): string => {
    return app.get(JwtService).sign({ userId: USER });
  };

  const gql = (ids: { systemId?: string; symbolId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token()}`]).send({
      query: 'mutation ($systemId: String!, $symbolId: String!) { deleteSymbol(systemId: $systemId, symbolId: $symbolId) { id systemId name description type content } }',
      variables: { systemId: ids.systemId ?? SYSTEM, symbolId: ids.symbolId ?? SYMBOL }
    });
  };

  const rest = (ids: { systemId?: string; symbolId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).delete(`/system/${ids.systemId ?? SYSTEM}/symbol/${ids.symbolId ?? SYMBOL}`).set('Cookie', [`token=${token()}`]);
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation deleteSymbol', (): void => {
    it('deletes the symbol', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(query).toHaveBeenNthCalledWith(2, SELECT_BY_ID, [SYMBOL, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_NOT_IN_USE, [SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(5, PRELOAD, [SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(7, DELETE, [SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(8, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { deleteSymbol: removed() } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the symbol is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: { error: 'Not Found', message: 'Symbol not found', statusCode: HttpStatus.NOT_FOUND },
              status: HttpStatus.NOT_FOUND
            },
            locations: [{ column: 53, line: 1 }],
            message: 'Symbol not found',
            path: ['deleteSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'FORBIDDEN',
              originalError: { error: 'Forbidden', message: 'User does not own the resource', statusCode: HttpStatus.FORBIDDEN }
            },
            locations: [{ column: 53, line: 1 }],
            message: 'User does not own the resource',
            path: ['deleteSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the ownership check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying ownership failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the symbol is in use', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_NOT_IN_USE, [SYMBOL], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: { error: 'Conflict', message: 'Symbols in use cannot change their type', statusCode: HttpStatus.CONFLICT },
              status: HttpStatus.CONFLICT
            },
            locations: [{ column: 53, line: 1 }],
            message: 'Symbols in use cannot change their type',
            path: ['deleteSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the in-use check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying symbol not in use failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the start transaction fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting symbol failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the start transaction and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting symbol failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the delete fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(7, DELETE, [SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting symbol failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the delete and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting symbol failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the commit fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(8, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting symbol failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the commit and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting symbol failed');
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

    it('reports an error when the symbol id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ symbolId: 'not-a-uuid' });

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
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 53, line: 1 }],
            message: 'Invalid token',
            path: ['deleteSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 53, line: 1 }],
            message: 'Invalid token',
            path: ['deleteSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the token payload has extra fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({ userId: USER, extra: true });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token}`]).send({
        query: 'mutation ($systemId: String!, $symbolId: String!) { deleteSymbol(systemId: $systemId, symbolId: $symbolId) { id systemId name description type content } }',
        variables: { systemId: SYSTEM, symbolId: SYMBOL }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 53, line: 1 }],
            message: 'Invalid token',
            path: ['deleteSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the token payload has invalid fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({ userId: 'not-a-uuid' });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token}`]).send({
        query: 'mutation ($systemId: String!, $symbolId: String!) { deleteSymbol(systemId: $systemId, symbolId: $symbolId) { id systemId name description type content } }',
        variables: { systemId: SYSTEM, symbolId: SYMBOL }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 53, line: 1 }],
            message: 'Invalid token',
            path: ['deleteSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the token cookie is not a JWT', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', ['token=not-a-jwt']).send({
        query: 'mutation ($systemId: String!, $symbolId: String!) { deleteSymbol(systemId: $systemId, symbolId: $symbolId) { id systemId name description type content } }',
        variables: { systemId: SYSTEM, symbolId: SYMBOL }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 53, line: 1 }],
            message: 'Unauthorized',
            path: ['deleteSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($systemId: String!, $symbolId: String!) { deleteSymbol(systemId: $systemId, symbolId: $symbolId) { id systemId name description type content } }',
        variables: { systemId: SYSTEM, symbolId: SYMBOL }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 53, line: 1 }],
            message: 'Unauthorized',
            path: ['deleteSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST DELETE /system/:systemId/symbol/:symbolId', (): void => {
    it('deletes the symbol', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_NOT_IN_USE, [SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(7, DELETE, [SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(8, 'COMMIT');
      expect(response.body).toStrictEqual(removed());
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when the symbol is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Symbol not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 403 when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({ error: 'Forbidden', message: 'User does not own the resource', statusCode: HttpStatus.FORBIDDEN });
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('responds with 500 when the ownership check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Verifying ownership failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 409 when the symbol is in use', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body).toStrictEqual({ error: 'Conflict', message: 'Symbols in use cannot change their type', statusCode: HttpStatus.CONFLICT });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('responds with 500 when the in-use check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Verifying symbol not in use failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the start transaction fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Deleting symbol failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the start transaction and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Deleting symbol failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the delete fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(7, DELETE, [SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Deleting symbol failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the delete and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Deleting symbol failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the commit fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(8, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Deleting symbol failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the commit and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Deleting symbol failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
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

    it('responds with 400 when the symbol id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ symbolId: 'not-a-uuid' });

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
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(response.body).toStrictEqual({ error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the token payload has extra fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({ userId: USER, extra: true });

      const response = await request(app.getHttpServer()).delete(`/system/${SYSTEM}/symbol/${SYMBOL}`).set('Cookie', [`token=${token}`]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the token payload has invalid fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({ userId: 'not-a-uuid' });

      const response = await request(app.getHttpServer()).delete(`/system/${SYSTEM}/symbol/${SYMBOL}`).set('Cookie', [`token=${token}`]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the token cookie is not a JWT', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).delete(`/system/${SYSTEM}/symbol/${SYMBOL}`).set('Cookie', ['token=not-a-jwt']);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).delete(`/system/${SYSTEM}/symbol/${SYMBOL}`);

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
