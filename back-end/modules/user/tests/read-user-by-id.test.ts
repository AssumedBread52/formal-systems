import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import request from 'supertest';

describe('Read User by ID', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query user', (): void => {
    it('returns the requested user', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($userId: String!) { user(userId: $userId) { id handle email } }',
        variables: {
          userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          user: {
            id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            handle: 'Test1 User1',
            email: 'test1.user1@example.com'
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no user matches', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($userId: String!) { user(userId: $userId) { id handle email } }',
        variables: {
          userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Not Found',
                message: 'User not found',
                statusCode: HttpStatus.NOT_FOUND
              },
              status: HttpStatus.NOT_FOUND
            },
            locations: [
              {
                column: 28,
                line: 1
              }
            ],
            message: 'User not found',
            path: [
              'user'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($userId: String!) { user(userId: $userId) { id handle email } }',
        variables: {
          userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Reading user failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 28,
                line: 1
              }
            ],
            message: 'Reading user failed',
            path: [
              'user'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($userId: String!) { user(userId: $userId) { id handle email } }',
        variables: {
          userId: 'not-a-uuid'
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
                message: 'Validation failed (uuid is expected)',
                statusCode: HttpStatus.BAD_REQUEST
              }
            },
            locations: [
              {
                column: 28,
                line: 1
              }
            ],
            message: 'Validation failed (uuid is expected)',
            path: [
              'user'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST GET /user/:userId', (): void => {
    it('returns the requested user', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).get('/user/f9c7d036-e7e1-4775-b33c-43138e506e82');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        handle: 'Test1 User1',
        email: 'test1.user1@example.com'
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when no user matches', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).get('/user/f9c7d036-e7e1-4775-b33c-43138e506e82');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Not Found',
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND
      });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 500 when the database read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get('/user/f9c7d036-e7e1-4775-b33c-43138e506e82');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading user failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get('/user/not-a-uuid');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: 'Validation failed (uuid is expected)',
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
