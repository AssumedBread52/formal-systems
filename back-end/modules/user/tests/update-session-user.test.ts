import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import request from 'supertest';

describe('Update Session User', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation updateSessionUser', (): void => {
    it('updates the user', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test2 User2',
            email: 'test2.user2@example.com',
            password: 'Test2User2!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'UPDATE "users" SET "handle" = $1, "email" = $2, "password_hash" = $3 WHERE "id" IN ($4)', [
        'Test2 User2',
        'test2.user2@example.com',
        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(7, 'COMMIT');
      expect(response.body).toStrictEqual({
        data: {
          updateSessionUser: {
            id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            handle: 'Test2 User2',
            email: 'test2.user2@example.com'
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('updates only the handle', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test2 User2'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(5, 'UPDATE "users" SET "handle" = $1 WHERE "id" IN ($2)', [
        'Test2 User2',
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(6, 'COMMIT');
      expect(response.body).toStrictEqual({
        data: {
          updateSessionUser: {
            id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            handle: 'Test2 User2',
            email: 'test1.user1@example.com'
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('updates only the email', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            email: 'test2.user2@example.com'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(5, 'UPDATE "users" SET "email" = $1 WHERE "id" IN ($2)', [
        'test2.user2@example.com',
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(6, 'COMMIT');
      expect(response.body).toStrictEqual({
        data: {
          updateSessionUser: {
            id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            handle: 'Test1 User1',
            email: 'test2.user2@example.com'
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('updates only the password', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            password: 'Test2User2!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'UPDATE "users" SET "password_hash" = $1 WHERE "id" IN ($2)', [
        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'COMMIT');
      expect(response.body).toStrictEqual({
        data: {
          updateSessionUser: {
            id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            handle: 'Test1 User1',
            email: 'test1.user1@example.com'
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('makes no changes when the payload is empty', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {}
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          updateSessionUser: {
            id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            handle: 'Test1 User1',
            email: 'test1.user1@example.com'
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('skips the uniqueness checks when the handle and email are unchanged', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test1 User1',
            email: 'test1.user1@example.com',
            password: 'Test2User2!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'UPDATE "users" SET "password_hash" = $1 WHERE "id" IN ($2)', [
        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'COMMIT');
      expect(response.body).toStrictEqual({
        data: {
          updateSessionUser: {
            id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            handle: 'Test1 User1',
            email: 'test1.user1@example.com'
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the new handle is taken', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          row_exists: 1
        }
      ]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test2 User2',
            email: 'test2.user2@example.com',
            password: 'Test2User2!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
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
                column: 45,
                line: 1
              }
            ],
            message: 'Users must have a unique handle',
            path: [
              'updateSessionUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the handle uniqueness check fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockRejectedValueOnce(new Error());

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test2 User2',
            email: 'test2.user2@example.com',
            password: 'Test2User2!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
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
                column: 45,
                line: 1
              }
            ],
            message: 'Verifying unique handle failed',
            path: [
              'updateSessionUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the new email is taken', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          row_exists: 1
        }
      ]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test2 User2',
            email: 'test2.user2@example.com',
            password: 'Test2User2!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
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
                column: 45,
                line: 1
              }
            ],
            message: 'Users must have a unique e-mail address',
            path: [
              'updateSessionUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the email uniqueness check fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test2 User2',
            email: 'test2.user2@example.com',
            password: 'Test2User2!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
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
                column: 45,
                line: 1
              }
            ],
            message: 'Verifying unique e-mail address failed',
            path: [
              'updateSessionUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the start transaction fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test2 User2',
            email: 'test2.user2@example.com',
            password: 'Test2User2!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Editing profile failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 45,
                line: 1
              }
            ],
            message: 'Editing profile failed',
            path: [
              'updateSessionUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the start transaction and rollback fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test2 User2',
            email: 'test2.user2@example.com',
            password: 'Test2User2!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Editing profile failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 45,
                line: 1
              }
            ],
            message: 'Editing profile failed',
            path: [
              'updateSessionUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the update fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test2 User2',
            email: 'test2.user2@example.com',
            password: 'Test2User2!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'UPDATE "users" SET "handle" = $1, "email" = $2, "password_hash" = $3 WHERE "id" IN ($4)', [
        'Test2 User2',
        'test2.user2@example.com',
        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Editing profile failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 45,
                line: 1
              }
            ],
            message: 'Editing profile failed',
            path: [
              'updateSessionUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the update and rollback fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test2 User2',
            email: 'test2.user2@example.com',
            password: 'Test2User2!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'UPDATE "users" SET "handle" = $1, "email" = $2, "password_hash" = $3 WHERE "id" IN ($4)', [
        'Test2 User2',
        'test2.user2@example.com',
        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Editing profile failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 45,
                line: 1
              }
            ],
            message: 'Editing profile failed',
            path: [
              'updateSessionUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the commit fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test2 User2',
            email: 'test2.user2@example.com',
            password: 'Test2User2!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'UPDATE "users" SET "handle" = $1, "email" = $2, "password_hash" = $3 WHERE "id" IN ($4)', [
        'Test2 User2',
        'test2.user2@example.com',
        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(7, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Editing profile failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 45,
                line: 1
              }
            ],
            message: 'Editing profile failed',
            path: [
              'updateSessionUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the commit and rollback fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test2 User2',
            email: 'test2.user2@example.com',
            password: 'Test2User2!'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'UPDATE "users" SET "handle" = $1, "email" = $2, "password_hash" = $3 WHERE "id" IN ($4)', [
        'Test2 User2',
        'test2.user2@example.com',
        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(7, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Editing profile failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 45,
                line: 1
              }
            ],
            message: 'Editing profile failed',
            path: [
              'updateSessionUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the payload field values are invalid', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'a'.repeat(51),
            email: 'not-an-email',
            password: 'weak'
          }
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
              code: 'BAD_REQUEST',
              originalError: {
                error: 'Bad Request',
                message: [
                  'handle must be shorter than or equal to 50 characters',
                  'email must be an email',
                  'password is not strong enough'
                ],
                statusCode: HttpStatus.BAD_REQUEST
              }
            },
            locations: [
              {
                column: 45,
                line: 1
              }
            ],
            message: 'Bad Request Exception',
            path: [
              'updateSessionUser'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the payload has extra fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($userPayload: EditUserPayload!) { updateSessionUser(userPayload: $userPayload) { id handle email } }',
        variables: {
          userPayload: {
            handle: 'Test2 User2',
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
            message: 'Variable "$userPayload" got invalid value { handle: "Test2 User2", extra: true }; Field "extra" is not defined by type "EditUserPayload".'
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('REST PATCH /user/session-user', (): void => {
    it('updates the user', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'Test2 User2',
        email: 'test2.user2@example.com',
        password: 'Test2User2!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'UPDATE "users" SET "handle" = $1, "email" = $2, "password_hash" = $3 WHERE "id" IN ($4)', [
        'Test2 User2',
        'test2.user2@example.com',
        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(7, 'COMMIT');
      expect(response.body).toStrictEqual({
        id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        handle: 'Test2 User2',
        email: 'test2.user2@example.com'
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('updates only the handle', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'Test2 User2'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(5, 'UPDATE "users" SET "handle" = $1 WHERE "id" IN ($2)', [
        'Test2 User2',
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(6, 'COMMIT');
      expect(response.body).toStrictEqual({
        id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        handle: 'Test2 User2',
        email: 'test1.user1@example.com'
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('updates only the email', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        email: 'test2.user2@example.com'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(5, 'UPDATE "users" SET "email" = $1 WHERE "id" IN ($2)', [
        'test2.user2@example.com',
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(6, 'COMMIT');
      expect(response.body).toStrictEqual({
        id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        handle: 'Test1 User1',
        email: 'test2.user2@example.com'
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('updates only the password', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        password: 'Test2User2!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'UPDATE "users" SET "password_hash" = $1 WHERE "id" IN ($2)', [
        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'COMMIT');
      expect(response.body).toStrictEqual({
        id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        handle: 'Test1 User1',
        email: 'test1.user1@example.com'
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('makes no changes when the payload is empty', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({});

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        handle: 'Test1 User1',
        email: 'test1.user1@example.com'
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('skips the uniqueness checks when the handle and email are unchanged', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'Test1 User1',
        email: 'test1.user1@example.com',
        password: 'Test2User2!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(4, 'UPDATE "users" SET "password_hash" = $1 WHERE "id" IN ($2)', [
        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'COMMIT');
      expect(response.body).toStrictEqual({
        id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        handle: 'Test1 User1',
        email: 'test1.user1@example.com'
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 409 when the new handle is taken', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          row_exists: 1
        }
      ]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'Test2 User2',
        email: 'test2.user2@example.com',
        password: 'Test2User2!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Conflict',
        message: 'Users must have a unique handle',
        statusCode: HttpStatus.CONFLICT
      });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('responds with 500 when the handle uniqueness check fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockRejectedValueOnce(new Error());

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'Test2 User2',
        email: 'test2.user2@example.com',
        password: 'Test2User2!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Verifying unique handle failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 409 when the new email is taken', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          row_exists: 1
        }
      ]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'Test2 User2',
        email: 'test2.user2@example.com',
        password: 'Test2User2!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Conflict',
        message: 'Users must have a unique e-mail address',
        statusCode: HttpStatus.CONFLICT
      });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('responds with 500 when the email uniqueness check fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'Test2 User2',
        email: 'test2.user2@example.com',
        password: 'Test2User2!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Verifying unique e-mail address failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the start transaction fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'Test2 User2',
        email: 'test2.user2@example.com',
        password: 'Test2User2!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Editing profile failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the start transaction and rollback fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'Test2 User2',
        email: 'test2.user2@example.com',
        password: 'Test2User2!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(6);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Editing profile failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the update fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'Test2 User2',
        email: 'test2.user2@example.com',
        password: 'Test2User2!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'UPDATE "users" SET "handle" = $1, "email" = $2, "password_hash" = $3 WHERE "id" IN ($4)', [
        'Test2 User2',
        'test2.user2@example.com',
        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Editing profile failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the update and rollback fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'Test2 User2',
        email: 'test2.user2@example.com',
        password: 'Test2User2!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'UPDATE "users" SET "handle" = $1, "email" = $2, "password_hash" = $3 WHERE "id" IN ($4)', [
        'Test2 User2',
        'test2.user2@example.com',
        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Editing profile failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the commit fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'Test2 User2',
        email: 'test2.user2@example.com',
        password: 'Test2User2!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'UPDATE "users" SET "handle" = $1, "email" = $2, "password_hash" = $3 WHERE "id" IN ($4)', [
        'Test2 User2',
        'test2.user2@example.com',
        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(7, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Editing profile failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the commit and rollback fails', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'Test2 User2',
        email: 'test2.user2@example.com',
        password: 'Test2User2!'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."handle" = $1))) LIMIT 1', [
        'Test2 User2'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "users" "UserEntity" WHERE (("UserEntity"."email" = $1))) LIMIT 1', [
        'test2.user2@example.com'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE "UserEntity"."id" IN ($1)', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, 'UPDATE "users" SET "handle" = $1, "email" = $2, "password_hash" = $3 WHERE "id" IN ($4)', [
        'Test2 User2',
        'test2.user2@example.com',
        expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(7, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Editing profile failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the payload field values are invalid', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'a'.repeat(51),
        email: 'not-an-email',
        password: 'weak'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: [
          'handle must be shorter than or equal to 50 characters',
          'email must be an email',
          'password is not strong enough'
        ],
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the payload has extra fields', async (): Promise<void> => {
      const passwordHash = hashSync('Test1User1!');

      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: passwordHash
        }
      ]));

      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
      });

      const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
        `token=${token}`
      ]).send({
        handle: 'Test2 User2',
        extra: true
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: [
          'property extra should not exist'
        ],
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
