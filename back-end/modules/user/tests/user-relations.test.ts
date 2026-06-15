import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import request from 'supertest';

describe('User Relations', (): void => {
  const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
  const handle = 'Test1 User1';
  const email = 'test1.user1@example.com';
  const password = 'Test1User1!';
  const systemId1 = 'ebe1615e-8c75-461a-b6f4-29db73a14ee7';
  const name1 = 'TestSystem1';
  const description1 = 'Test System 1';
  const systemId2 = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
  const name2 = 'TestSystem2';
  const description2 = 'Test System 2';
  const readUserByIdSql = 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1';
  const loadSystemsByOwnerSql = 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."owner_user_id" IN ($1)))';
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql user', (): void => {
    const operation = 'query ($userId: String!) { user(userId: $userId) { id systems { id ownerUserId name description } } }';

    it('resolves multiple systems owned by the user', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: userId,
          UserEntity_handle: handle,
          UserEntity_email: email,
          UserEntity_password_hash: hashSync(password)
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: systemId1,
          SystemEntity_owner_user_id: userId,
          SystemEntity_name: name1,
          SystemEntity_description: description1
        },
        {
          SystemEntity_id: systemId2,
          SystemEntity_owner_user_id: userId,
          SystemEntity_name: name2,
          SystemEntity_description: description2
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: operation,
        variables: {
          userId
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, readUserByIdSql, [
        userId
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, loadSystemsByOwnerSql, [
        userId
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          user: {
            id: userId,
            systems: [
              {
                id: systemId1,
                ownerUserId: userId,
                name: name1,
                description: description1
              },
              {
                id: systemId2,
                ownerUserId: userId,
                name: name2,
                description: description2
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
          UserEntity_id: userId,
          UserEntity_handle: handle,
          UserEntity_email: email,
          UserEntity_password_hash: hashSync(password)
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: operation,
        variables: {
          userId
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, readUserByIdSql, [
        userId
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, loadSystemsByOwnerSql, [
        userId
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          user: {
            id: userId,
            systems: []
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the systems fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: userId,
          UserEntity_handle: handle,
          UserEntity_email: email,
          UserEntity_password_hash: hashSync(password)
        }
      ]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: operation,
        variables: {
          userId
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, readUserByIdSql, [
        userId
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, loadSystemsByOwnerSql, [
        userId
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
