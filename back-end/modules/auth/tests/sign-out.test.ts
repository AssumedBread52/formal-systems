import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { clearCookieMock } from '@/common/tests/mocks/clear-cookie.mock';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import request from 'supertest';

describe('Sign Out', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  const clearCookie = clearCookieMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation signOut', (): void => {
    it('signs out and clears auth cookies', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation { signOut { id handle email } }'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [        'f9c7d036-e7e1-4775-b33c-43138e506e82'      ], true);
      expect(response.body).toStrictEqual({
        data: {
          signOut: {
            id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            handle: 'Test1 User1',
            email: 'test1.user1@example.com'
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      const cookies = response.get('Set-Cookie');

      expect(clearCookie).toHaveBeenCalledTimes(2);
      expect(clearCookie).toHaveBeenNthCalledWith(1, 'token');
      expect(clearCookie).toHaveBeenNthCalledWith(2, 'authStatus');
      expect(cookies).toBeDefined();
      expect(cookies).toHaveLength(2);
      expect(cookies![0]).toBe('token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      expect(cookies![1]).toBe('authStatus=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    });

    it('reports an error when the session user is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation { signOut { id handle email } }'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [        'f9c7d036-e7e1-4775-b33c-43138e506e82'      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'UNAUTHENTICATED',
              originalError: {
                error: 'Unauthorized',
                message: 'Invalid token',
                statusCode: HttpStatus.UNAUTHORIZED
              }
            },
            locations: [
              {
                column: 12,
                line: 1
              }
            ],
            message: 'Invalid token',
            path: [
              'signOut'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(clearCookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when the read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation { signOut { id handle email } }'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [        'f9c7d036-e7e1-4775-b33c-43138e506e82'      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'UNAUTHENTICATED',
              originalError: {
                error: 'Unauthorized',
                message: 'Invalid token',
                statusCode: HttpStatus.UNAUTHORIZED
              }
            },
            locations: [
              {
                column: 12,
                line: 1
              }
            ],
            message: 'Invalid token',
            path: [
              'signOut'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(clearCookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when the token payload has extra fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        extra: true
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation { signOut { id handle email } }'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'UNAUTHENTICATED',
              originalError: {
                error: 'Unauthorized',
                message: 'Invalid token',
                statusCode: HttpStatus.UNAUTHORIZED
              }
            },
            locations: [
              {
                column: 12,
                line: 1
              }
            ],
            message: 'Invalid token',
            path: [
              'signOut'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(clearCookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when the token payload has invalid fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({
        userId: 'not-a-uuid'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation { signOut { id handle email } }'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'UNAUTHENTICATED',
              originalError: {
                error: 'Unauthorized',
                message: 'Invalid token',
                statusCode: HttpStatus.UNAUTHORIZED
              }
            },
            locations: [
              {
                column: 12,
                line: 1
              }
            ],
            message: 'Invalid token',
            path: [
              'signOut'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(clearCookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when the token cookie is not a JWT', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        'token=not-a-jwt'
      ]).send({
        query: 'mutation { signOut { id handle email } }'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'UNAUTHENTICATED',
              originalError: {
                message: 'Unauthorized',
                statusCode: HttpStatus.UNAUTHORIZED
              }
            },
            locations: [
              {
                column: 12,
                line: 1
              }
            ],
            message: 'Unauthorized',
            path: [
              'signOut'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(clearCookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation { signOut { id handle email } }'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'UNAUTHENTICATED',
              originalError: {
                message: 'Unauthorized',
                statusCode: HttpStatus.UNAUTHORIZED
              }
            },
            locations: [
              {
                column: 12,
                line: 1
              }
            ],
            message: 'Unauthorized',
            path: [
              'signOut'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(clearCookie).toHaveBeenCalledTimes(0);
    });

    it('reports an error when clearing the auth cookies fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));
      clearCookie.mockImplementationOnce((): never => {
        throw new Error();
      });

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation { signOut { id handle email } }'
      });

      const cookies = response.get('Set-Cookie');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(clearCookie).toHaveBeenCalledTimes(1);
      expect(clearCookie).toHaveBeenNthCalledWith(1, 'token');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Sign out failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 12,
                line: 1
              }
            ],
            message: 'Sign out failed',
            path: [
              'signOut'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookies).toBeUndefined();
    });
  });

  describe('REST POST /auth/sign-out', (): void => {
    it('signs out and clears auth cookies', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/auth/sign-out').set('Cookie', [
        `token=${token}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [        'f9c7d036-e7e1-4775-b33c-43138e506e82'      ], true);
      expect(response.body).toStrictEqual({});
      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
      const cookies = response.get('Set-Cookie');

      expect(clearCookie).toHaveBeenCalledTimes(2);
      expect(clearCookie).toHaveBeenNthCalledWith(1, 'token');
      expect(clearCookie).toHaveBeenNthCalledWith(2, 'authStatus');
      expect(cookies).toBeDefined();
      expect(cookies).toHaveLength(2);
      expect(cookies![0]).toBe('token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      expect(cookies![1]).toBe('authStatus=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    });

    it('responds with 401 when the session user is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/auth/sign-out').set('Cookie', [
        `token=${token}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [        'f9c7d036-e7e1-4775-b33c-43138e506e82'      ], true);
      expect(response.body).toStrictEqual({
        error: 'Unauthorized',
        message: 'Invalid token',
        statusCode: HttpStatus.UNAUTHORIZED
      });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(clearCookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 401 when the read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/auth/sign-out').set('Cookie', [
        `token=${token}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [        'f9c7d036-e7e1-4775-b33c-43138e506e82'      ], true);
      expect(response.body).toStrictEqual({
        error: 'Unauthorized',
        message: 'Invalid token',
        statusCode: HttpStatus.UNAUTHORIZED
      });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(clearCookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 401 when the token payload has extra fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        extra: true
      });

      const response = await request(app.getHttpServer()).post('/auth/sign-out').set('Cookie', [
        `token=${token}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        error: 'Unauthorized',
        message: 'Invalid token',
        statusCode: HttpStatus.UNAUTHORIZED
      });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(clearCookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 401 when the token payload has invalid fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({
        userId: 'not-a-uuid'
      });

      const response = await request(app.getHttpServer()).post('/auth/sign-out').set('Cookie', [
        `token=${token}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        error: 'Unauthorized',
        message: 'Invalid token',
        statusCode: HttpStatus.UNAUTHORIZED
      });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(clearCookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 401 when the token cookie is not a JWT', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/auth/sign-out').set('Cookie', [
        'token=not-a-jwt'
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        message: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED
      });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(clearCookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 401 when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/auth/sign-out');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        message: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED
      });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(clearCookie).toHaveBeenCalledTimes(0);
    });

    it('responds with 500 when clearing the auth cookies fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));
      clearCookie.mockImplementationOnce((): never => {
        throw new Error();
      });

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/auth/sign-out').set('Cookie', [
        `token=${token}`
      ]);

      const cookies = response.get('Set-Cookie');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(clearCookie).toHaveBeenCalledTimes(1);
      expect(clearCookie).toHaveBeenNthCalledWith(1, 'token');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Sign out failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(cookies).toBeUndefined();
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
