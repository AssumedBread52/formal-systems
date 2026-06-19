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
const VERIFY_UNIQUE_NAME = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "symbols" "SymbolEntity" WHERE (("SymbolEntity"."system_id" = $1) AND ("SymbolEntity"."name" = $2))) LIMIT 1';
const VERIFY_TYPE_CHANGEABLE = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "symbols" "SymbolEntity" LEFT JOIN "expression_tokens" "SymbolEntity__SymbolEntity_expressionTokens" ON "SymbolEntity__SymbolEntity_expressionTokens"."system_id"="SymbolEntity"."system_id" AND "SymbolEntity__SymbolEntity_expressionTokens"."symbol_id"="SymbolEntity"."id"  LEFT JOIN "expressions" "e215cd75db3b02651976a7790f9339f077972236" ON "e215cd75db3b02651976a7790f9339f077972236"."system_id"="SymbolEntity__SymbolEntity_expressionTokens"."system_id" AND "e215cd75db3b02651976a7790f9339f077972236"."id"="SymbolEntity__SymbolEntity_expressionTokens"."expression_id"  LEFT JOIN "statements" "0f2722275534bf18a7629043aad2498bb5eb31f4" ON "0f2722275534bf18a7629043aad2498bb5eb31f4"."system_id"="e215cd75db3b02651976a7790f9339f077972236"."system_id" AND "0f2722275534bf18a7629043aad2498bb5eb31f4"."assertion_expression_id"="e215cd75db3b02651976a7790f9339f077972236"."id"  LEFT JOIN "statement_hypotheses" "331d1564e574365a7ece9f64e9e90d98bd787d98" ON "331d1564e574365a7ece9f64e9e90d98bd787d98"."system_id"="e215cd75db3b02651976a7790f9339f077972236"."system_id" AND "331d1564e574365a7ece9f64e9e90d98bd787d98"."expression_id"="e215cd75db3b02651976a7790f9339f077972236"."id" WHERE (("SymbolEntity"."id" = $1) AND (((((((((NOT("0f2722275534bf18a7629043aad2498bb5eb31f4"."id" IS NULL)))))) OR (((((NOT("331d1564e574365a7ece9f64e9e90d98bd787d98"."id" IS NULL)))))))))))) LIMIT 1';
const PRELOAD = 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE "SymbolEntity"."id" IN ($1)';
const SET_ISOLATION = 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE';

describe('Update Symbol', (): void => {
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

  const token = (): string => {
    return app.get(JwtService).sign({ userId: USER });
  };

  const gql = (symbolPayload: Record<string, unknown>, ids: { systemId?: string; symbolId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token()}`]).send({
      query: 'mutation ($systemId: String!, $symbolId: String!, $symbolPayload: EditSymbolPayload!) { updateSymbol(systemId: $systemId, symbolId: $symbolId, symbolPayload: $symbolPayload) { id systemId name description type content } }',
      variables: { systemId: ids.systemId ?? SYSTEM, symbolId: ids.symbolId ?? SYMBOL, symbolPayload }
    });
  };

  const rest = (body: Record<string, unknown>, ids: { systemId?: string; symbolId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).patch(`/system/${ids.systemId ?? SYSTEM}/symbol/${ids.symbolId ?? SYMBOL}`).set('Cookie', [`token=${token()}`]).send(body);
  };

  const body = (overrides: Record<string, unknown>): Record<string, unknown> => {
    return { id: SYMBOL, systemId: SYSTEM, name: 'TestSymbol1', description: 'Test Symbol 1', type: 'constant', content: 'A', ...overrides };
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation updateSymbol', (): void => {
    it('updates the name', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(query).toHaveBeenNthCalledWith(2, SELECT_BY_ID, [SYMBOL, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_UNIQUE_NAME, [SYSTEM, 'TestSymbol2'], true);
      expect(query).toHaveBeenNthCalledWith(5, PRELOAD, [SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(7, 'UPDATE "symbols" SET "name" = $1 WHERE "id" IN ($2)', ['TestSymbol2', SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(8, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { updateSymbol: body({ name: 'TestSymbol2' }) } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('updates the description', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ description: 'Test Symbol 2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(4, PRELOAD, [SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(6, 'UPDATE "symbols" SET "description" = $1 WHERE "id" IN ($2)', ['Test Symbol 2', SYMBOL], true);
      expect(response.body).toStrictEqual({ data: { updateSymbol: body({ description: 'Test Symbol 2' }) } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('updates the content', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ content: 'B' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, 'UPDATE "symbols" SET "content" = $1 WHERE "id" IN ($2)', ['B', SYMBOL], true);
      expect(response.body).toStrictEqual({ data: { updateSymbol: body({ content: 'B' }) } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('updates the type within a serializable transaction', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ type: 'variable' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(4, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(5, SET_ISOLATION);
      expect(query).toHaveBeenNthCalledWith(6, VERIFY_TYPE_CHANGEABLE, [SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(7, PRELOAD, [SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(8, 'UPDATE "symbols" SET "type" = $1 WHERE "id" IN ($2)', ['variable', SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(9, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { updateSymbol: body({ type: 'variable' }) } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('makes no changes when the payload is empty', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));

      const response = await gql({});

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(4, PRELOAD, [SYMBOL], true);
      expect(response.body).toStrictEqual({ data: { updateSymbol: body({}) } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('skips the uniqueness check when the name is unchanged', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ name: 'TestSymbol1', description: 'Test Symbol 2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(4, PRELOAD, [SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(6, 'UPDATE "symbols" SET "description" = $1 WHERE "id" IN ($2)', ['Test Symbol 2', SYMBOL], true);
      expect(response.body).toStrictEqual({ data: { updateSymbol: body({ description: 'Test Symbol 2' }) } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the symbol is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ name: 'TestSymbol2' });

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
            locations: [{ column: 89, line: 1 }],
            message: 'Symbol not found',
            path: ['updateSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'FORBIDDEN',
              originalError: { error: 'Forbidden', message: 'User does not own the resource', statusCode: HttpStatus.FORBIDDEN }
            },
            locations: [{ column: 89, line: 1 }],
            message: 'User does not own the resource',
            path: ['updateSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the new name is taken', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await gql({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_UNIQUE_NAME, [SYSTEM, 'TestSymbol2'], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: { error: 'Conflict', message: 'Symbols in the same system must have a unique name', statusCode: HttpStatus.CONFLICT },
              status: HttpStatus.CONFLICT
            },
            locations: [{ column: 89, line: 1 }],
            message: 'Symbols in the same system must have a unique name',
            path: ['updateSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the name uniqueness check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying unique name failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the type cannot be changed', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ type: 'variable' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, VERIFY_TYPE_CHANGEABLE, [SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'BAD_USER_INPUT',
              originalError: { error: 'Unprocessable Entity', message: 'Symbols used in expressions in use cannot change their type', statusCode: HttpStatus.UNPROCESSABLE_ENTITY }
            },
            locations: [{ column: 89, line: 1 }],
            message: 'Symbols used in expressions in use cannot change their type',
            path: ['updateSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the type changeable check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ type: 'variable' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying symbol type is changeable failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the payload field values are invalid', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ name: 'a'.repeat(201), description: 'a'.repeat(5001), content: 'a'.repeat(251) });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'BAD_REQUEST',
              originalError: {
                error: 'Bad Request',
                message: [
                  'name must be shorter than or equal to 200 characters',
                  'description must be shorter than or equal to 5000 characters',
                  'content must be shorter than or equal to 250 characters'
                ],
                statusCode: HttpStatus.BAD_REQUEST
              }
            },
            locations: [{ column: 89, line: 1 }],
            message: 'Bad Request Exception',
            path: ['updateSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the payload has extra fields', async (): Promise<void> => {
      const response = await gql({ name: 'TestSymbol2', extra: true });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        errors: [
          {
            extensions: { code: 'BAD_USER_INPUT' },
            locations: [{ column: 51, line: 1 }],
            message: 'Variable "$symbolPayload" got invalid value { name: "TestSymbol2", extra: true }; Field "extra" is not defined by type "EditSymbolPayload".'
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('reports an error when the system id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ name: 'TestSymbol2' }, { systemId: 'not-a-uuid' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Validation failed (uuid is expected)');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the symbol id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ name: 'TestSymbol2' }, { symbolId: 'not-a-uuid' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Validation failed (uuid is expected)');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the session user is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 89, line: 1 }],
            message: 'Invalid token',
            path: ['updateSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await gql({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 89, line: 1 }],
            message: 'Invalid token',
            path: ['updateSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the token payload has extra fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({ userId: USER, extra: true });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token}`]).send({
        query: 'mutation ($systemId: String!, $symbolId: String!, $symbolPayload: EditSymbolPayload!) { updateSymbol(systemId: $systemId, symbolId: $symbolId, symbolPayload: $symbolPayload) { id systemId name description type content } }',
        variables: { systemId: SYSTEM, symbolId: SYMBOL, symbolPayload: { name: 'TestSymbol2' } }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 89, line: 1 }],
            message: 'Invalid token',
            path: ['updateSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the token payload has invalid fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({ userId: 'not-a-uuid' });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token}`]).send({
        query: 'mutation ($systemId: String!, $symbolId: String!, $symbolPayload: EditSymbolPayload!) { updateSymbol(systemId: $systemId, symbolId: $symbolId, symbolPayload: $symbolPayload) { id systemId name description type content } }',
        variables: { systemId: SYSTEM, symbolId: SYMBOL, symbolPayload: { name: 'TestSymbol2' } }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 89, line: 1 }],
            message: 'Invalid token',
            path: ['updateSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the token cookie is not a JWT', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', ['token=not-a-jwt']).send({
        query: 'mutation ($systemId: String!, $symbolId: String!, $symbolPayload: EditSymbolPayload!) { updateSymbol(systemId: $systemId, symbolId: $symbolId, symbolPayload: $symbolPayload) { id systemId name description type content } }',
        variables: { systemId: SYSTEM, symbolId: SYMBOL, symbolPayload: { name: 'TestSymbol2' } }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 89, line: 1 }],
            message: 'Unauthorized',
            path: ['updateSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($systemId: String!, $symbolId: String!, $symbolPayload: EditSymbolPayload!) { updateSymbol(systemId: $systemId, symbolId: $symbolId, symbolPayload: $symbolPayload) { id systemId name description type content } }',
        variables: { systemId: SYSTEM, symbolId: SYMBOL, symbolPayload: { name: 'TestSymbol2' } }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 89, line: 1 }],
            message: 'Unauthorized',
            path: ['updateSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST PATCH /system/:systemId/symbol/:symbolId', (): void => {
    it('updates the name', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_UNIQUE_NAME, [SYSTEM, 'TestSymbol2'], true);
      expect(query).toHaveBeenNthCalledWith(7, 'UPDATE "symbols" SET "name" = $1 WHERE "id" IN ($2)', ['TestSymbol2', SYMBOL], true);
      expect(response.body).toStrictEqual(body({ name: 'TestSymbol2' }));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('updates the type within a serializable transaction', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ type: 'variable' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(4, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(5, SET_ISOLATION);
      expect(query).toHaveBeenNthCalledWith(6, VERIFY_TYPE_CHANGEABLE, [SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(8, 'UPDATE "symbols" SET "type" = $1 WHERE "id" IN ($2)', ['variable', SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(9, 'COMMIT');
      expect(response.body).toStrictEqual(body({ type: 'variable' }));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('makes no changes when the payload is empty', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));

      const response = await rest({});

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body).toStrictEqual(body({}));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when the symbol is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Symbol not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 403 when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({ error: 'Forbidden', message: 'User does not own the resource', statusCode: HttpStatus.FORBIDDEN });
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('responds with 409 when the new name is taken', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await rest({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body).toStrictEqual({ error: 'Conflict', message: 'Symbols in the same system must have a unique name', statusCode: HttpStatus.CONFLICT });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('responds with 422 when the type cannot be changed', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ type: 'variable' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Unprocessable Entity', message: 'Symbols used in expressions in use cannot change their type', statusCode: HttpStatus.UNPROCESSABLE_ENTITY });
      expect(response.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('responds with 500 when the type changeable check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ type: 'variable' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Verifying symbol type is changeable failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
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

      const response = await rest({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Updating symbol failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
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

      const response = await rest({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Updating symbol failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the update fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(7, 'UPDATE "symbols" SET "name" = $1 WHERE "id" IN ($2)', ['TestSymbol2', SYMBOL], true);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Updating symbol failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the update and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await rest({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Updating symbol failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
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

      const response = await rest({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(8, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Updating symbol failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
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

      const response = await rest({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Updating symbol failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the payload field values are invalid', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ name: 'a'.repeat(201), description: 'a'.repeat(5001), content: 'a'.repeat(251) });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: [
          'name must be shorter than or equal to 200 characters',
          'description must be shorter than or equal to 5000 characters',
          'content must be shorter than or equal to 250 characters'
        ],
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the type is not a valid symbol type', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ type: 'nonsense' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: ['type must be one of the following values: constant, variable'],
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the payload has extra fields', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ name: 'TestSymbol2', extra: true });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: ['property extra should not exist'],
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the system id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ name: 'TestSymbol2' }, { systemId: 'not-a-uuid' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the symbol id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ name: 'TestSymbol2' }, { symbolId: 'not-a-uuid' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 401 when the session user is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(response.body).toStrictEqual({ error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await rest({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the token payload has extra fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({ userId: USER, extra: true });

      const response = await request(app.getHttpServer()).patch(`/system/${SYSTEM}/symbol/${SYMBOL}`).set('Cookie', [`token=${token}`]).send({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the token payload has invalid fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({ userId: 'not-a-uuid' });

      const response = await request(app.getHttpServer()).patch(`/system/${SYSTEM}/symbol/${SYMBOL}`).set('Cookie', [`token=${token}`]).send({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the token cookie is not a JWT', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).patch(`/system/${SYSTEM}/symbol/${SYMBOL}`).set('Cookie', ['token=not-a-jwt']).send({ name: 'TestSymbol2' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).patch(`/system/${SYSTEM}/symbol/${SYMBOL}`).send({ name: 'TestSymbol2' });

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
