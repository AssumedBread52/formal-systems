import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import request from 'supertest';

describe('User Relations', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql user', (): void => {
    it('resolves multiple systems owned by the user', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        },
        {
          SystemEntity_id: 'a1b2c3d4-e5f6-4778-9abc-def012345678',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem2',
          SystemEntity_description: 'Test System 2'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($userId: String!) { user(userId: $userId) { id systems { id ownerUserId name description } } }',
        variables: {
          userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."owner_user_id" IN ($1)))', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          user: {
            id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            systems: [
              {
                id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
                ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
                name: 'TestSystem1',
                description: 'Test System 1'
              },
              {
                id: 'a1b2c3d4-e5f6-4778-9abc-def012345678',
                ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
                name: 'TestSystem2',
                description: 'Test System 2'
              }
            ]
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when the user owns no systems', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($userId: String!) { user(userId: $userId) { id systems { id ownerUserId name description } } }',
        variables: {
          userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."owner_user_id" IN ($1)))', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          user: {
            id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            systems: []
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the systems fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($userId: String!) { user(userId: $userId) { id systems { id ownerUserId name description } } }',
        variables: {
          userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."owner_user_id" IN ($1)))', [
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
                message: 'Loading systems by owner user ID failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 55,
                line: 1
              }
            ],
            message: 'Loading systems by owner user ID failed',
            path: [
              'user',
              'systems'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
