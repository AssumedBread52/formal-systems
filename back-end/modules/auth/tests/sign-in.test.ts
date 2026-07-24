import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { cookieMock } from '@/common/tests/mocks/cookie.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import request from 'supertest';

describe('Sign In', (): void => {
  const cookie = cookieMock();
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation signIn', (): void => {
    it('signs in and sets auth cookies', async (): Promise<void> => {
      getOrThrow.mockReturnValueOnce(1000);
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($email: String!, $password: String!) { signIn(email: $email, password: $password) { id handle email } }',
        variables: {
          email: 'test1.user1@example.com',
          password: 'Test1User1!'
        }
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(2);
      expect(cookie).toHaveBeenNthCalledWith(1, 'token', expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/), {
        httpOnly: true,
        maxAge: 1000,
        secure: true
      });
      expect(cookie).toHaveBeenNthCalledWith(2, 'authStatus', 'true', {
        maxAge: 1000,
        secure: true
      });
      expect(getOrThrow).toHaveBeenCalledTimes(1);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          signIn: {
            id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            handle: 'Test1 User1',
            email: 'test1.user1@example.com'
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookies).toBeDefined();
      expect(cookies).toHaveLength(2);
      expect(cookies![0]).toMatch(/^token=[\w-]+\.[\w-]+\.[\w-]+; Max-Age=1; Path=\/; Expires=.+; HttpOnly; Secure$/);
      expect(cookies![1]).toMatch(/^authStatus=true; Max-Age=1; Path=\/; Expires=.+; Secure$/);
    });

    it('reports an error when attaching auth status cookie fails', async (): Promise<void> => {
      cookie.mockImplementationOnce(cookie.getMockImplementation()!);
      cookie.mockImplementationOnce((): never => {
        throw new Error();
      });
      getOrThrow.mockReturnValueOnce(1000);
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($email: String!, $password: String!) { signIn(email: $email, password: $password) { id handle email } }',
        variables: {
          email: 'test1.user1@example.com',
          password: 'Test1User1!'
        }
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(2);
      expect(cookie).toHaveBeenNthCalledWith(1, 'token', expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/), {
        httpOnly: true,
        maxAge: 1000,
        secure: true
      });
      expect(cookie).toHaveBeenNthCalledWith(2, 'authStatus', 'true', {
        maxAge: 1000,
        secure: true
      });
      expect(getOrThrow).toHaveBeenCalledTimes(1);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Sign in failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 50,
                line: 1
              }
            ],
            message: 'Sign in failed',
            path: [
              'signIn'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookies).toBeDefined();
      expect(cookies).toHaveLength(1);
      expect(cookies![0]).toMatch(/^token=[\w-]+\.[\w-]+\.[\w-]+; Max-Age=1; Path=\/; Expires=.+; HttpOnly; Secure$/);
    });

    it('reports an error when attaching token cookie fails', async (): Promise<void> => {
      cookie.mockImplementationOnce((): never => {
        throw new Error();
      });
      getOrThrow.mockReturnValueOnce(1000);
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($email: String!, $password: String!) { signIn(email: $email, password: $password) { id handle email } }',
        variables: {
          email: 'test1.user1@example.com',
          password: 'Test1User1!'
        }
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(1);
      expect(cookie).toHaveBeenNthCalledWith(1, 'token', expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/), {
        httpOnly: true,
        maxAge: 1000,
        secure: true
      });
      expect(getOrThrow).toHaveBeenCalledTimes(1);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Sign in failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 50,
                line: 1
              }
            ],
            message: 'Sign in failed',
            path: [
              'signIn'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookies).toBeUndefined();
    });

    it('reports an error when getting cookie configuration fails', async (): Promise<void> => {
      getOrThrow.mockImplementationOnce((): never => {
        throw new Error();
      });
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($email: String!, $password: String!) { signIn(email: $email, password: $password) { id handle email } }',
        variables: {
          email: 'test1.user1@example.com',
          password: 'Test1User1!'
        }
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(0);
      expect(getOrThrow).toHaveBeenCalledTimes(1);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Sign in failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 50,
                line: 1
              }
            ],
            message: 'Sign in failed',
            path: [
              'signIn'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookies).toBeUndefined();
    });

    it('reports an error when signing the new token fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'not-a-uuid',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($email: String!, $password: String!) { signIn(email: $email, password: $password) { id handle email } }',
        variables: {
          email: 'test1.user1@example.com',
          password: 'Test1User1!'
        }
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(0);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Sign in failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 50,
                line: 1
              }
            ],
            message: 'Sign in failed',
            path: [
              'signIn'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookies).toBeUndefined();
    });

    it('reports an error when the password is incorrect', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'not-a-uuid',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($email: String!, $password: String!) { signIn(email: $email, password: $password) { id handle email } }',
        variables: {
          email: 'test1.user1@example.com',
          password: 'Test1User2!'
        }
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(0);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'UNAUTHENTICATED',
              originalError: {
                error: 'Unauthorized',
                message: 'Invalid e-mail address or password',
                statusCode: HttpStatus.UNAUTHORIZED
              }
            },
            locations: [
              {
                column: 50,
                line: 1
              }
            ],
            message: 'Invalid e-mail address or password',
            path: [
              'signIn'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookies).toBeUndefined();
    });

    it('reports an error when the session user is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($email: String!, $password: String!) { signIn(email: $email, password: $password) { id handle email } }',
        variables: {
          email: 'test1.user1@example.com',
          password: 'Test1User2!'
        }
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(0);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'UNAUTHENTICATED',
              originalError: {
                error: 'Unauthorized',
                message: 'Invalid e-mail address or password',
                statusCode: HttpStatus.UNAUTHORIZED
              }
            },
            locations: [
              {
                column: 50,
                line: 1
              }
            ],
            message: 'Invalid e-mail address or password',
            path: [
              'signIn'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookies).toBeUndefined();
    });

    it('reports an error when finding the session user fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($email: String!, $password: String!) { signIn(email: $email, password: $password) { id handle email } }',
        variables: {
          email: 'test1.user1@example.com',
          password: 'Test1User2!'
        }
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(0);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'UNAUTHENTICATED',
              originalError: {
                error: 'Unauthorized',
                message: 'Invalid e-mail address or password',
                statusCode: HttpStatus.UNAUTHORIZED
              }
            },
            locations: [
              {
                column: 50,
                line: 1
              }
            ],
            message: 'Invalid e-mail address or password',
            path: [
              'signIn'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(cookies).toBeUndefined();
    });

    it('reports an error when no credentials have been provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($email: String!, $password: String!) { signIn(email: $email, password: $password) { id handle email } }'
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(0);
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
            message: 'Variable "$email" of required type "String!" was not provided.'
          },
          {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
            locations: [
              {
                column: 28,
                line: 1
              }
            ],
            message: 'Variable "$password" of required type "String!" was not provided.'
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(cookies).toBeUndefined();
    });
  });

  describe('REST POST /auth/sign-in', (): void => {
    it('signs in and sets auth cookies', async (): Promise<void> => {
      getOrThrow.mockReturnValueOnce(1000);
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(2);
      expect(cookie).toHaveBeenNthCalledWith(1, 'token', expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/), {
        httpOnly: true,
        maxAge: 1000,
        secure: true
      });
      expect(cookie).toHaveBeenNthCalledWith(2, 'authStatus', 'true', {
        maxAge: 1000,
        secure: true
      });
      expect(getOrThrow).toHaveBeenCalledTimes(1);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
      });
      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
      expect(cookies).toBeDefined();
      expect(cookies).toHaveLength(2);
      expect(cookies![0]).toMatch(/^token=[\w-]+\.[\w-]+\.[\w-]+; Max-Age=1; Path=\/; Expires=.+; HttpOnly; Secure$/);
      expect(cookies![1]).toMatch(/^authStatus=true; Max-Age=1; Path=\/; Expires=.+; Secure$/);
    });

    it('responds with 500 when attaching auth status cookie fails', async (): Promise<void> => {
      cookie.mockImplementationOnce(cookie.getMockImplementation()!);
      cookie.mockImplementationOnce((): never => {
        throw new Error();
      });
      getOrThrow.mockReturnValueOnce(1000);
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(2);
      expect(cookie).toHaveBeenNthCalledWith(1, 'token', expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/), {
        httpOnly: true,
        maxAge: 1000,
        secure: true
      });
      expect(cookie).toHaveBeenNthCalledWith(2, 'authStatus', 'true', {
        maxAge: 1000,
        secure: true
      });
      expect(getOrThrow).toHaveBeenCalledTimes(1);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Sign in failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(cookies).toBeDefined();
      expect(cookies).toHaveLength(1);
      expect(cookies![0]).toMatch(/^token=[\w-]+\.[\w-]+\.[\w-]+; Max-Age=1; Path=\/; Expires=.+; HttpOnly; Secure$/);
    });

    it('responds with 500 when attaching token cookie fails', async (): Promise<void> => {
      cookie.mockImplementationOnce((): never => {
        throw new Error();
      });
      getOrThrow.mockReturnValueOnce(1000);
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(1);
      expect(cookie).toHaveBeenNthCalledWith(1, 'token', expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/), {
        httpOnly: true,
        maxAge: 1000,
        secure: true
      });
      expect(getOrThrow).toHaveBeenCalledTimes(1);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Sign in failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(cookies).toBeUndefined();
    });

    it('responds with 500 when getting cookie configuration fails', async (): Promise<void> => {
      getOrThrow.mockImplementationOnce((): never => {
        throw new Error();
      });
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(0);
      expect(getOrThrow).toHaveBeenCalledTimes(1);
      expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Sign in failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(cookies).toBeUndefined();
    });

    it('responds with 500 when signing the new token fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'not-a-uuid',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
        email: 'test1.user1@example.com',
        password: 'Test1User1!'
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(0);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Sign in failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(cookies).toBeUndefined();
    });

    it('responds with 401 when the password is incorrect', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'not-a-uuid',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
        email: 'test1.user1@example.com',
        password: 'Test1User2!'
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(0);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Unauthorized',
        message: 'Invalid e-mail address or password',
        statusCode: HttpStatus.UNAUTHORIZED
      });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(cookies).toBeUndefined();
    });

    it('responds with 401 when the session user is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
        email: 'test1.user1@example.com',
        password: 'Test1User2!'
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(0);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Unauthorized',
        message: 'Invalid e-mail address or password',
        statusCode: HttpStatus.UNAUTHORIZED
      });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(cookies).toBeUndefined();
    });

    it('responds with 401 when finding the session user fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
        email: 'test1.user1@example.com',
        password: 'Test1User2!'
      });

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(0);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1)) LIMIT 1', [
        'test1.user1@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Unauthorized',
        message: 'Invalid e-mail address or password',
        statusCode: HttpStatus.UNAUTHORIZED
      });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(cookies).toBeUndefined();
    });

    it('responds with 401 when no credentials have been provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/auth/sign-in');

      const cookies = response.get('Set-Cookie');

      expect(cookie).toHaveBeenCalledTimes(0);
      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        message: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED
      });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(cookies).toBeUndefined();
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
