import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import request from 'supertest';

describe('Read Users', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query users', (): void => {
    it('returns a page of results with a text filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchUsersPayload!) { users(filters: $filters) { results { id handle email } total } }',
        variables: {
          filters: {
            page: 2,
            pageSize: 20,
            searchText: 'est'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (((("UserEntity"."handle" ILIKE $1))) OR ((("UserEntity"."email" ILIKE $2)))) LIMIT 20 OFFSET 20', [
        '%est%',
        '%est%'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          users: {
            results: [
              {
                id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
                handle: 'Test1 User1',
                email: 'test1.user1@example.com'
              }
            ],
            total: 21
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of empty results', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          cnt: 20
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchUsersPayload!) { users(filters: $filters) { results { id handle email } total } }',
        variables: {
          filters: {
            page: 2,
            pageSize: 20,
            searchText: 'est'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (((("UserEntity"."handle" ILIKE $1))) OR ((("UserEntity"."email" ILIKE $2)))) LIMIT 20 OFFSET 20', [
        '%est%',
        '%est%'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT COUNT(1) AS "cnt" FROM "users" "UserEntity" WHERE (((("UserEntity"."handle" ILIKE $1))) OR ((("UserEntity"."email" ILIKE $2))))', [
        '%est%',
        '%est%'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          users: {
            results: [],
            total: 20
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results without a text filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchUsersPayload!) { users(filters: $filters) { results { id handle email } total } }',
        variables: {
          filters: {
            page: 2,
            pageSize: 20
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" LIMIT 20 OFFSET 20', [], true);
      expect(response.body).toStrictEqual({
        data: {
          users: {
            results: [
              {
                id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
                handle: 'Test1 User1',
                email: 'test1.user1@example.com'
              }
            ],
            total: 21
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database user search fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchUsersPayload!) { users(filters: $filters) { results { id handle email } total } }',
        variables: {
          filters: {
            page: 2,
            pageSize: 20
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" LIMIT 20 OFFSET 20', [], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Reading users failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 41,
                line: 1
              }
            ],
            message: 'Reading users failed',
            path: [
              'users'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database user count fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchUsersPayload!) { users(filters: $filters) { results { id handle email } total } }',
        variables: {
          filters: {
            page: 2,
            pageSize: 20,
            searchText: 'est'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (((("UserEntity"."handle" ILIKE $1))) OR ((("UserEntity"."email" ILIKE $2)))) LIMIT 20 OFFSET 20', [
        '%est%',
        '%est%'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT COUNT(1) AS "cnt" FROM "users" "UserEntity" WHERE (((("UserEntity"."handle" ILIKE $1))) OR ((("UserEntity"."email" ILIKE $2))))', [
        '%est%',
        '%est%'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Reading users failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 41,
                line: 1
              }
            ],
            message: 'Reading users failed',
            path: [
              'users'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the pagination values are out of range', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchUsersPayload!) { users(filters: $filters) { results { id handle email } total } }',
        variables: {
          filters: {
            page: 0,
            pageSize: -1,
            searchText: ''
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
                  'page must not be less than 1',
                  'pageSize must not be less than 1'
                ],
                statusCode: HttpStatus.BAD_REQUEST
              }
            },
            locations: [
              {
                column: 41,
                line: 1
              }
            ],
            message: 'Bad Request Exception',
            path: [
              'users'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the search parameters are the wrong type', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchUsersPayload!) { users(filters: $filters) { results { id handle email } total } }',
        variables: {
          filters: {
            page: 'a',
            pageSize: 'a',
            searchText: [],
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
                column: 8,
                line: 1
              }
            ],
            message: 'Variable "$filters" got invalid value "a" at "filters.page"; Int cannot represent non-integer value: "a"'
          },
          {
            extensions: {
              code: 'BAD_USER_INPUT'
            },
            locations: [
              {
                column: 8,
                line: 1
              }
            ],
            message: 'Variable "$filters" got invalid value "a" at "filters.pageSize"; Int cannot represent non-integer value: "a"'
          },
          {
            extensions: {
              code: 'BAD_USER_INPUT'
            },
            locations: [
              {
                column: 8,
                line: 1
              }
            ],
            message: 'Variable "$filters" got invalid value [] at "filters.searchText"; String cannot represent a non string value: []'
          },
          {
            extensions: {
              code: 'BAD_USER_INPUT'
            },
            locations: [
              {
                column: 8,
                line: 1
              }
            ],
            message: 'Variable "$filters" got invalid value { page: "a", pageSize: "a", searchText: [], extra: true }; Field "extra" is not defined by type "SearchUsersPayload".'
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('REST GET /user', (): void => {
    it('returns a page of results with a text filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const filters = new URLSearchParams();

      filters.set('page', '2');
      filters.set('pageSize', '20');
      filters.set('searchText', 'est');

      const response = await request(app.getHttpServer()).get(`/user?${filters}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (((("UserEntity"."handle" ILIKE $1))) OR ((("UserEntity"."email" ILIKE $2)))) LIMIT 20 OFFSET 20', [
        '%est%',
        '%est%'
      ], true);
      expect(response.body).toStrictEqual({
        results: [
          {
            id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            handle: 'Test1 User1',
            email: 'test1.user1@example.com'
          }
        ],
        total: 21
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of empty results', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          cnt: 20
        }
      ]));

      const filters = new URLSearchParams();

      filters.set('page', '2');
      filters.set('pageSize', '20');
      filters.set('searchText', 'est');

      const response = await request(app.getHttpServer()).get(`/user?${filters}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (((("UserEntity"."handle" ILIKE $1))) OR ((("UserEntity"."email" ILIKE $2)))) LIMIT 20 OFFSET 20', [
        '%est%',
        '%est%'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT COUNT(1) AS "cnt" FROM "users" "UserEntity" WHERE (((("UserEntity"."handle" ILIKE $1))) OR ((("UserEntity"."email" ILIKE $2))))', [
        '%est%',
        '%est%'
      ], true);
      expect(response.body).toStrictEqual({
        results: [],
        total: 20
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results without a text filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          UserEntity_handle: 'Test1 User1',
          UserEntity_email: 'test1.user1@example.com',
          UserEntity_password_hash: hashSync('Test1User1!')
        }
      ]));

      const filters = new URLSearchParams();

      filters.set('page', '2');
      filters.set('pageSize', '20');

      const response = await request(app.getHttpServer()).get(`/user?${filters}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" LIMIT 20 OFFSET 20', [], true);
      expect(response.body).toStrictEqual({
        results: [
          {
            id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            handle: 'Test1 User1',
            email: 'test1.user1@example.com'
          }
        ],
        total: 21
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 500 when the database user search fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const filters = new URLSearchParams();

      filters.set('page', '2');
      filters.set('pageSize', '20');

      const response = await request(app.getHttpServer()).get(`/user?${filters}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" LIMIT 20 OFFSET 20', [], true);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading users failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the database user count fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());

      const filters = new URLSearchParams();

      filters.set('page', '2');
      filters.set('pageSize', '20');
      filters.set('searchText', 'est');

      const response = await request(app.getHttpServer()).get(`/user?${filters}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (((("UserEntity"."handle" ILIKE $1))) OR ((("UserEntity"."email" ILIKE $2)))) LIMIT 20 OFFSET 20', [
        '%est%',
        '%est%'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT COUNT(1) AS "cnt" FROM "users" "UserEntity" WHERE (((("UserEntity"."handle" ILIKE $1))) OR ((("UserEntity"."email" ILIKE $2))))', [
        '%est%',
        '%est%'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading users failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the pagination values are out of range', async (): Promise<void> => {
      const filters = new URLSearchParams();

      filters.set('page', '0');
      filters.set('pageSize', '-1');
      filters.set('searchText', '');

      const response = await request(app.getHttpServer()).get(`/user?${filters}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: [
          'page must not be less than 1',
          'pageSize must not be less than 1'
        ],
        statusCode: HttpStatus.BAD_REQUEST
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the search parameters are the wrong type', async (): Promise<void> => {
      const filters = new URLSearchParams();

      filters.set('page', 'a');
      filters.set('pageSize', 'a');
      filters.set('searchText', '[]');
      filters.set('extra', 'true');

      const response = await request(app.getHttpServer()).get(`/user?${filters}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: [
          'property extra should not exist',
          'page must not be less than 1',
          'page must be an integer number',
          'pageSize must not be less than 1',
          'pageSize must be an integer number'
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
