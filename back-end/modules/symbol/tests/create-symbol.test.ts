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
const VERIFY_OWNERSHIP = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1) AND ("SystemEntity"."owner_user_id" = $2))) LIMIT 1';
const VERIFY_UNIQUE_NAME = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "symbols" "SymbolEntity" WHERE (("SymbolEntity"."system_id" = $1) AND ("SymbolEntity"."name" = $2))) LIMIT 1';
const INSERT = 'INSERT INTO "symbols"("id", "system_id", "name", "description", "type", "content") VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING "id"';

describe('Create Symbol', (): void => {
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

  const gql = (symbolPayload: Record<string, unknown>, systemId: string = SYSTEM): request.Test => {
    return request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token()}`]).send({
      query: 'mutation ($systemId: String!, $symbolPayload: NewSymbolPayload!) { createSymbol(systemId: $systemId, symbolPayload: $symbolPayload) { id systemId name description type content } }',
      variables: { systemId, symbolPayload }
    });
  };

  const rest = (body: Record<string, unknown>, systemId: string = SYSTEM): request.Test => {
    return request(app.getHttpServer()).post(`/system/${systemId}/symbol`).set('Cookie', [`token=${token()}`]).send(body);
  };

  const validPayload = (): Record<string, unknown> => {
    return { name: 'TestSymbol1', description: 'Test Symbol 1', type: 'constant', content: 'A' };
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation createSymbol', (): void => {
    it('creates the symbol', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: SYMBOL }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(query).toHaveBeenNthCalledWith(2, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_UNIQUE_NAME, [SYSTEM, 'TestSymbol1'], true);
      expect(query).toHaveBeenNthCalledWith(4, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(5, INSERT, [SYSTEM, 'TestSymbol1', 'Test Symbol 1', 'constant', 'A'], true);
      expect(query).toHaveBeenNthCalledWith(6, 'COMMIT');
      expect(response.body).toStrictEqual({
        data: {
          createSymbol: {
            id: SYMBOL,
            systemId: SYSTEM,
            name: 'TestSymbol1',
            description: 'Test Symbol 1',
            type: 'constant',
            content: 'A'
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'FORBIDDEN',
              originalError: { error: 'Forbidden', message: 'User does not own the resource', statusCode: HttpStatus.FORBIDDEN }
            },
            locations: [{ column: 68, line: 1 }],
            message: 'User does not own the resource',
            path: ['createSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the ownership check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: { error: 'Internal Server Error', message: 'Verifying ownership failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [{ column: 68, line: 1 }],
            message: 'Verifying ownership failed',
            path: ['createSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the name is taken', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_UNIQUE_NAME, [SYSTEM, 'TestSymbol1'], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: { error: 'Conflict', message: 'Symbols in the same system must have a unique name', statusCode: HttpStatus.CONFLICT },
              status: HttpStatus.CONFLICT
            },
            locations: [{ column: 68, line: 1 }],
            message: 'Symbols in the same system must have a unique name',
            path: ['createSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the name uniqueness check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: { error: 'Internal Server Error', message: 'Verifying unique name failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [{ column: 68, line: 1 }],
            message: 'Verifying unique name failed',
            path: ['createSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the start transaction fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(4, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(5, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Creating symbol failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the start transaction and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(5, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Creating symbol failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the insert fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(5, INSERT, [SYSTEM, 'TestSymbol1', 'Test Symbol 1', 'constant', 'A'], true);
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Creating symbol failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the insert and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Creating symbol failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the commit fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: SYMBOL }]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Creating symbol failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the commit and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: SYMBOL }]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Creating symbol failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when required fields are blank', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ name: '', description: '', type: 'constant', content: '' });

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
                message: ['name should not be empty', 'description should not be empty', 'content should not be empty'],
                statusCode: HttpStatus.BAD_REQUEST
              }
            },
            locations: [{ column: 68, line: 1 }],
            message: 'Bad Request Exception',
            path: ['createSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when fields exceed their maximum length', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ name: 'a'.repeat(201), description: 'a'.repeat(5001), type: 'constant', content: 'a'.repeat(251) });

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
            locations: [{ column: 68, line: 1 }],
            message: 'Bad Request Exception',
            path: ['createSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the payload has extra fields', async (): Promise<void> => {
      const response = await gql({ name: 'TestSymbol1', description: 'Test Symbol 1', type: 'constant', content: 'A', extra: true });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        errors: [
          {
            extensions: { code: 'BAD_USER_INPUT' },
            locations: [{ column: 31, line: 1 }],
            message: 'Variable "$symbolPayload" got invalid value { name: "TestSymbol1", description: "Test Symbol 1", type: "constant", content: "A", extra: true }; Field "extra" is not defined by type "NewSymbolPayload".'
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('reports an error when the system id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql(validPayload(), 'not-a-uuid');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'BAD_REQUEST',
              originalError: { error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST }
            },
            locations: [{ column: 68, line: 1 }],
            message: 'Validation failed (uuid is expected)',
            path: ['createSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the session user is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 68, line: 1 }],
            message: 'Invalid token',
            path: ['createSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 68, line: 1 }],
            message: 'Invalid token',
            path: ['createSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the token payload has extra fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({ userId: USER, extra: true });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token}`]).send({
        query: 'mutation ($systemId: String!, $symbolPayload: NewSymbolPayload!) { createSymbol(systemId: $systemId, symbolPayload: $symbolPayload) { id systemId name description type content } }',
        variables: { systemId: SYSTEM, symbolPayload: validPayload() }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 68, line: 1 }],
            message: 'Invalid token',
            path: ['createSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the token payload has invalid fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({ userId: 'not-a-uuid' });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token}`]).send({
        query: 'mutation ($systemId: String!, $symbolPayload: NewSymbolPayload!) { createSymbol(systemId: $systemId, symbolPayload: $symbolPayload) { id systemId name description type content } }',
        variables: { systemId: SYSTEM, symbolPayload: validPayload() }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 68, line: 1 }],
            message: 'Invalid token',
            path: ['createSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the token cookie is not a JWT', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', ['token=not-a-jwt']).send({
        query: 'mutation ($systemId: String!, $symbolPayload: NewSymbolPayload!) { createSymbol(systemId: $systemId, symbolPayload: $symbolPayload) { id systemId name description type content } }',
        variables: { systemId: SYSTEM, symbolPayload: validPayload() }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 68, line: 1 }],
            message: 'Unauthorized',
            path: ['createSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($systemId: String!, $symbolPayload: NewSymbolPayload!) { createSymbol(systemId: $systemId, symbolPayload: $symbolPayload) { id systemId name description type content } }',
        variables: { systemId: SYSTEM, symbolPayload: validPayload() }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: { code: 'UNAUTHENTICATED', originalError: { message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED } },
            locations: [{ column: 68, line: 1 }],
            message: 'Unauthorized',
            path: ['createSymbol']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST POST /system/:systemId/symbol', (): void => {
    it('creates the symbol', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: SYMBOL }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(query).toHaveBeenNthCalledWith(2, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_UNIQUE_NAME, [SYSTEM, 'TestSymbol1'], true);
      expect(query).toHaveBeenNthCalledWith(4, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(5, INSERT, [SYSTEM, 'TestSymbol1', 'Test Symbol 1', 'constant', 'A'], true);
      expect(query).toHaveBeenNthCalledWith(6, 'COMMIT');
      expect(response.body).toStrictEqual({
        id: SYMBOL,
        systemId: SYSTEM,
        name: 'TestSymbol1',
        description: 'Test Symbol 1',
        type: 'constant',
        content: 'A'
      });
      expect(response.statusCode).toBe(HttpStatus.CREATED);
    });

    it('responds with 403 when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({
        error: 'Forbidden',
        message: 'User does not own the resource',
        statusCode: HttpStatus.FORBIDDEN
      });
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('responds with 500 when the ownership check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockRejectedValueOnce(new Error());

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Verifying ownership failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 409 when the name is taken', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({
        error: 'Conflict',
        message: 'Symbols in the same system must have a unique name',
        statusCode: HttpStatus.CONFLICT
      });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('responds with 500 when the name uniqueness check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Verifying unique name failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the start transaction fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(4, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(5, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Creating symbol failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the start transaction and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(5, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Creating symbol failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the insert fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(5, INSERT, [SYSTEM, 'TestSymbol1', 'Test Symbol 1', 'constant', 'A'], true);
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Creating symbol failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the insert and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Creating symbol failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the commit fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: SYMBOL }]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Creating symbol failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the commit and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ id: SYMBOL }]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Creating symbol failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when required fields are blank', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ name: '', description: '', type: 'constant', content: '' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: ['name should not be empty', 'description should not be empty', 'content should not be empty'],
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when fields exceed their maximum length', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ name: 'a'.repeat(201), description: 'a'.repeat(5001), type: 'constant', content: 'a'.repeat(251) });

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

      const response = await rest({ name: 'TestSymbol1', description: 'Test Symbol 1', type: 'nonsense', content: 'A' });

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

      const response = await rest({ name: 'TestSymbol1', description: 'Test Symbol 1', type: 'constant', content: 'A', extra: true });

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

      const response = await rest(validPayload(), 'not-a-uuid');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: 'Validation failed (uuid is expected)',
        statusCode: HttpStatus.BAD_REQUEST
      });
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

    it('responds with 401 when the read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the token payload has extra fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({ userId: USER, extra: true });

      const response = await request(app.getHttpServer()).post(`/system/${SYSTEM}/symbol`).set('Cookie', [`token=${token}`]).send(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the token payload has invalid fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({ userId: 'not-a-uuid' });

      const response = await request(app.getHttpServer()).post(`/system/${SYSTEM}/symbol`).set('Cookie', [`token=${token}`]).send(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ error: 'Unauthorized', message: 'Invalid token', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the token cookie is not a JWT', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post(`/system/${SYSTEM}/symbol`).set('Cookie', ['token=not-a-jwt']).send(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post(`/system/${SYSTEM}/symbol`).send(validPayload());

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
