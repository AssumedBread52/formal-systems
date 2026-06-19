import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { cookieMock } from '@/common/tests/mocks/cookie.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

describe('Create User', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  const cookie = cookieMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation createUser', (): void => {
    it('creates the user and sets auth cookies', async (): Promise<void> => {
      getOrThrow.mockReturnValueOnce(1000);
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce(buildQueryResult([
        {
          id: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      ]));
      query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test1 User1',
            email: 'test1.user1@example.com',
            password: 'Test1User1!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(1);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'INSERT INTO "users"("id", "handle", "email", "password_hash") VALUES (DEFAULT, $1, $2, $3) RETURNING "id"', [        'Test1 User1',        'test1.user1@example.com',        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'COMMIT');
      expect(response.body).toStrictEqual({
        data: {
          createUser: {
            id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            handle: 'Test1 User1',
            email: 'test1.user1@example.com'
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(2);
      expect(cookie).toHaveBeenNthCalledWith(1, 'token', expect.stringMatching(/^[\w-]+\.[\w-]+\.[\w-]+$/), { httpOnly: true, maxAge: 1000, secure: true });
      expect(cookie).toHaveBeenNthCalledWith(2, 'authStatus', 'true', { maxAge: 1000, secure: true });
      expect(cookies).toBeDefined();
      expect(cookies).toHaveLength(2);
      expect(cookies![0]).toMatch(/^token=[\w-]+\.[\w-]+\.[\w-]+; Max-Age=1; Path=\/; Expires=.+; HttpOnly; Secure$/);
      expect(cookies![1]).toMatch(/^authStatus=true; Max-Age=1; Path=\/; Expires=.+; Secure$/);
    });

    it('reports an error when getting cookie configuration fails', async (): Promise<void> => {
      getOrThrow.mockImplementationOnce((): never => {
        throw new Error();
      });
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce(buildQueryResult([
        {
          id: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      ]));
      query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test1 User1',
            email: 'test1.user1@example.com',
            password: 'Test1User1!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(1);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'INSERT INTO "users"("id", "handle", "email", "password_hash") VALUES (DEFAULT, $1, $2, $3) RETURNING "id"', [        'Test1 User1',        'test1.user1@example.com',        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'COMMIT');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Sign up failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 44,
                line: 1
              }
            ],
            message: 'Sign up failed',
            path: [
              'createUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when commit fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce(buildQueryResult([
        {
          id: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      ]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test1 User1',
            email: 'test1.user1@example.com',
            password: 'Test1User1!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'INSERT INTO "users"("id", "handle", "email", "password_hash") VALUES (DEFAULT, $1, $2, $3) RETURNING "id"', [        'Test1 User1',        'test1.user1@example.com',        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Sign up failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 44,
                line: 1
              }
            ],
            message: 'Sign up failed',
            path: [
              'createUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when commit and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce(buildQueryResult([
        {
          id: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      ]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test1 User1',
            email: 'test1.user1@example.com',
            password: 'Test1User1!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'INSERT INTO "users"("id", "handle", "email", "password_hash") VALUES (DEFAULT, $1, $2, $3) RETURNING "id"', [        'Test1 User1',        'test1.user1@example.com',        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Sign up failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 44,
                line: 1
              }
            ],
            message: 'Sign up failed',
            path: [
              'createUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when insert fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce([]);
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test1 User1',
            email: 'test1.user1@example.com',
            password: 'Test1User1!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'INSERT INTO "users"("id", "handle", "email", "password_hash") VALUES (DEFAULT, $1, $2, $3) RETURNING "id"', [        'Test1 User1',        'test1.user1@example.com',        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Sign up failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 44,
                line: 1
              }
            ],
            message: 'Sign up failed',
            path: [
              'createUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when insert and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce([]);
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test1 User1',
            email: 'test1.user1@example.com',
            password: 'Test1User1!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'INSERT INTO "users"("id", "handle", "email", "password_hash") VALUES (DEFAULT, $1, $2, $3) RETURNING "id"', [        'Test1 User1',        'test1.user1@example.com',        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Sign up failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 44,
                line: 1
              }
            ],
            message: 'Sign up failed',
            path: [
              'createUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when start transaction fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test1 User1',
            email: 'test1.user1@example.com',
            password: 'Test1User1!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Sign up failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 44,
                line: 1
              }
            ],
            message: 'Sign up failed',
            path: [
              'createUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when start transaction and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test1 User1',
            email: 'test1.user1@example.com',
            password: 'Test1User1!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Sign up failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 44,
                line: 1
              }
            ],
            message: 'Sign up failed',
            path: [
              'createUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when e-mail address is taken', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          row_exists: 1
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test1 User1',
            email: 'test1.user1@example.com',
            password: 'Test1User1!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Conflict',
                message: 'Users must have a unique e-mail address',
                statusCode: HttpStatus.CONFLICT
              },
              status: HttpStatus.CONFLICT
            },
            locations: [
              {
                column: 44,
                line: 1
              }
            ],
            message: 'Users must have a unique e-mail address',
            path: [
              'createUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when e-mail uniqueness check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test1 User1',
            email: 'test1.user1@example.com',
            password: 'Test1User1!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Verifying unique e-mail address failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 44,
                line: 1
              }
            ],
            message: 'Verifying unique e-mail address failed',
            path: [
              'createUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when handle is taken', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          row_exists: 1
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test1 User1',
            email: 'test1.user1@example.com',
            password: 'Test1User1!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Conflict',
                message: 'Users must have a unique handle',
                statusCode: HttpStatus.CONFLICT
              },
              status: HttpStatus.CONFLICT
            },
            locations: [
              {
                column: 44,
                line: 1
              }
            ],
            message: 'Users must have a unique handle',
            path: [
              'createUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when handle uniqueness check fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test1 User1',
            email: 'test1.user1@example.com',
            password: 'Test1User1!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Verifying unique handle failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 44,
                line: 1
              }
            ],
            message: 'Verifying unique handle failed',
            path: [
              'createUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when required fields are blank', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: '',
            email: '',
            password: ''
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'BAD_REQUEST',
              originalError: {
                error: 'Bad Request',
                message: [
                  'handle should not be empty',
                  'email must be an email',
                  'password is not strong enough'
                ],
                statusCode: HttpStatus.BAD_REQUEST
              }
            },
            locations: [
              {
                column: 44,
                line: 1
              }
            ],
            message: 'Bad Request Exception',
            path: [
              'createUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when fields exceed their maximum length', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'a'.repeat(51),
            email: 'a'.repeat(255),
            password: 'Test1User1!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'BAD_REQUEST',
              originalError: {
                error: 'Bad Request',
                message: [
                  'handle must be shorter than or equal to 50 characters',
                  'email must be shorter than or equal to 254 characters',
                  'email must be an email'
                ],
                statusCode: HttpStatus.BAD_REQUEST
              }
            },
            locations: [
              {
                column: 44,
                line: 1
              }
            ],
            message: 'Bad Request Exception',
            path: [
              'createUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when the payload has extra fields', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test1 User1',
            email: 'test1.user1@example.com',
            password: 'Test1User1!',
            extra: true
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        errors: [
          {
            extensions: {
              code: 'BAD_USER_INPUT'
            },
            locations: [
              {
                column: 11,
                line: 1
              }
            ],
            message: `Variable "$userPayload" got invalid value { handle: "Test1 User1", email: "test1.user1@example.com", password: "Test1User1!", extra: true }; Field "extra" is not defined by type "NewUserPayload".`
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(cookie).toHaveBeenCalledTimes(0);
    });
  });

  describe('REST POST /user', (): void => {
    it('creates the user and sets auth cookies', async (): Promise<void> => {
      getOrThrow.mockReturnValueOnce(1000);
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce(buildQueryResult([
        {
          id: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      ]));
      query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer()).post('/user').send({
        handle: 'Test1 User1',
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(1);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'INSERT INTO "users"("id", "handle", "email", "password_hash") VALUES (DEFAULT, $1, $2, $3) RETURNING "id"', [        'Test1 User1',        'test1.user1@example.com',        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'COMMIT');
      expect(response.body).toStrictEqual({
        id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        handle: 'Test1 User1',
        email: 'test1.user1@example.com'
      });
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(2);
      expect(cookie).toHaveBeenNthCalledWith(1, 'token', expect.stringMatching(/^[\w-]+\.[\w-]+\.[\w-]+$/), { httpOnly: true, maxAge: 1000, secure: true });
      expect(cookie).toHaveBeenNthCalledWith(2, 'authStatus', 'true', { maxAge: 1000, secure: true });
      expect(cookies).toBeDefined();
      expect(cookies).toHaveLength(2);
      expect(cookies![0]).toMatch(/^token=[\w-]+\.[\w-]+\.[\w-]+; Max-Age=1; Path=\/; Expires=.+; HttpOnly; Secure$/);
      expect(cookies![1]).toMatch(/^authStatus=true; Max-Age=1; Path=\/; Expires=.+; Secure$/);
    });

    it('responds with 500 when getting cookie configuration fails', async (): Promise<void> => {
      getOrThrow.mockImplementationOnce((): never => {
        throw new Error();
      });
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce(buildQueryResult([
        {
          id: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      ]));
      query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer()).post('/user').send({
        handle: 'Test1 User1',
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(1);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'INSERT INTO "users"("id", "handle", "email", "password_hash") VALUES (DEFAULT, $1, $2, $3) RETURNING "id"', [        'Test1 User1',        'test1.user1@example.com',        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'COMMIT');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Sign up failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 500 when commit fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce(buildQueryResult([
        {
          id: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      ]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer()).post('/user').send({
        handle: 'Test1 User1',
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'INSERT INTO "users"("id", "handle", "email", "password_hash") VALUES (DEFAULT, $1, $2, $3) RETURNING "id"', [        'Test1 User1',        'test1.user1@example.com',        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Sign up failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 500 when commit and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce([]);
      query.mockResolvedValueOnce(buildQueryResult([
        {
          id: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      ]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/user').send({
        handle: 'Test1 User1',
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'INSERT INTO "users"("id", "handle", "email", "password_hash") VALUES (DEFAULT, $1, $2, $3) RETURNING "id"', [        'Test1 User1',        'test1.user1@example.com',        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Sign up failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 500 when insert fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce([]);
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer()).post('/user').send({
        handle: 'Test1 User1',
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'INSERT INTO "users"("id", "handle", "email", "password_hash") VALUES (DEFAULT, $1, $2, $3) RETURNING "id"', [        'Test1 User1',        'test1.user1@example.com',        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Sign up failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 500 when insert and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce([]);
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/user').send({
        handle: 'Test1 User1',
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'INSERT INTO "users"("id", "handle", "email", "password_hash") VALUES (DEFAULT, $1, $2, $3) RETURNING "id"', [        'Test1 User1',        'test1.user1@example.com',        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Sign up failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 500 when start transaction fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer()).post('/user').send({
        handle: 'Test1 User1',
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Sign up failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 500 when start transaction and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/user').send({
        handle: 'Test1 User1',
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Sign up failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 409 when e-mail address is taken', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          row_exists: 1
        }
      ]));

      const response = await request(app.getHttpServer()).post('/user').send({
        handle: 'Test1 User1',
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(response.body).toStrictEqual({
        error: 'Conflict',
        message: 'Users must have a unique e-mail address',
        statusCode: HttpStatus.CONFLICT
      });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 500 when e-mail uniqueness check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/user').send({
        handle: 'Test1 User1',
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [        'test1.user1@example.com'      ], true);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Verifying unique e-mail address failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 409 when handle is taken', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          row_exists: 1
        }
      ]));

      const response = await request(app.getHttpServer()).post('/user').send({
        handle: 'Test1 User1',
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(response.body).toStrictEqual({
        error: 'Conflict',
        message: 'Users must have a unique handle',
        statusCode: HttpStatus.CONFLICT
      });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 500 when handle uniqueness check fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/user').send({
        handle: 'Test1 User1',
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [        'Test1 User1'      ], true);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Verifying unique handle failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 400 when required fields are blank', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/user').send({
        handle: '',
        email: '',
        password: ''
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: [
          'handle should not be empty',
          'email must be an email',
          'password is not strong enough'
        ],
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 400 when fields exceed their maximum length', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/user').send({
        handle: 'a'.repeat(51),
        email: 'a'.repeat(255),
        password: 'Test1User1!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: [
          'handle must be shorter than or equal to 50 characters',
          'email must be shorter than or equal to 254 characters',
          'email must be an email'
        ],
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(cookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 400 when the payload has extra fields', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/user').send({
        handle: 'Test1 User1',
        email: 'test1.user1@example.com',
        password: 'Test1User1!',
        extra: true
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: [
          'property extra should not exist'
        ],
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(cookie).toHaveBeenCalledTimes(0);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.clearAllMocks();
  });
});
