import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

describe('Read Systems', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query systems', (): void => {
    it('returns a page of results with both filters', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchSystemsPayload!) { systems(filters: $filters) { results { id ownerUserId name description } total } }',
        variables: {
          filters: {
            page: 2,
            pageSize: 20,
            ownerUserIds: [
              'f9c7d036-e7e1-4775-b33c-43138e506e82'
            ],
            searchText: 'est'
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (((("SystemEntity"."owner_user_id" IN ($1)) AND ("SystemEntity"."name" ILIKE $2))) OR ((("SystemEntity"."owner_user_id" IN ($3)) AND ("SystemEntity"."description" ILIKE $4)))) LIMIT 20 OFFSET 20', [        'f9c7d036-e7e1-4775-b33c-43138e506e82',        '%est%',        'f9c7d036-e7e1-4775-b33c-43138e506e82',        '%est%'      ], true);
      expect(response.body).toStrictEqual({
        data: {
          systems: {
            results: [
              {
                id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
                ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
                name: 'TestSystem1',
                description: 'Test System 1'
              }
            ],
            total: 21
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results filtered by owner', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchSystemsPayload!) { systems(filters: $filters) { results { id ownerUserId name description } total } }',
        variables: {
          filters: {
            page: 2,
            pageSize: 20,
            ownerUserIds: [
              'f9c7d036-e7e1-4775-b33c-43138e506e82'
            ]
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (((("SystemEntity"."owner_user_id" IN ($1))))) LIMIT 20 OFFSET 20', [        'f9c7d036-e7e1-4775-b33c-43138e506e82'      ], true);
      expect(response.body).toStrictEqual({
        data: {
          systems: {
            results: [
              {
                id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
                ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
                name: 'TestSystem1',
                description: 'Test System 1'
              }
            ],
            total: 21
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with a text filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchSystemsPayload!) { systems(filters: $filters) { results { id ownerUserId name description } total } }',
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
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (((("SystemEntity"."name" ILIKE $1))) OR ((("SystemEntity"."description" ILIKE $2)))) LIMIT 20 OFFSET 20', [        '%est%',        '%est%'      ], true);
      expect(response.body).toStrictEqual({
        data: {
          systems: {
            results: [
              {
                id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
                ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
                name: 'TestSystem1',
                description: 'Test System 1'
              }
            ],
            total: 21
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results without a filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchSystemsPayload!) { systems(filters: $filters) { results { id ownerUserId name description } total } }',
        variables: {
          filters: {
            page: 2,
            pageSize: 20
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" LIMIT 20 OFFSET 20', [], true);
      expect(response.body).toStrictEqual({
        data: {
          systems: {
            results: [
              {
                id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
                ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
                name: 'TestSystem1',
                description: 'Test System 1'
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
        query: 'query ($filters: SearchSystemsPayload!) { systems(filters: $filters) { results { id } total } }',
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
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (((("SystemEntity"."name" ILIKE $1))) OR ((("SystemEntity"."description" ILIKE $2)))) LIMIT 20 OFFSET 20', [        '%est%',        '%est%'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT COUNT(1) AS "cnt" FROM "systems" "SystemEntity" WHERE (((("SystemEntity"."name" ILIKE $1))) OR ((("SystemEntity"."description" ILIKE $2))))', [        '%est%',        '%est%'      ], true);
      expect(response.body).toStrictEqual({
        data: {
          systems: {
            results: [],
            total: 20
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database system search fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchSystemsPayload!) { systems(filters: $filters) { results { id ownerUserId name description } total } }',
        variables: {
          filters: {
            page: 2,
            pageSize: 20
          }
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" LIMIT 20 OFFSET 20', [], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Reading systems failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 43,
                line: 1
              }
            ],
            message: 'Reading systems failed',
            path: [
              'systems'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database system count fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchSystemsPayload!) { systems(filters: $filters) { results { id ownerUserId name description } total } }',
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
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (((("SystemEntity"."name" ILIKE $1))) OR ((("SystemEntity"."description" ILIKE $2)))) LIMIT 20 OFFSET 20', [        '%est%',        '%est%'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT COUNT(1) AS "cnt" FROM "systems" "SystemEntity" WHERE (((("SystemEntity"."name" ILIKE $1))) OR ((("SystemEntity"."description" ILIKE $2))))', [        '%est%',        '%est%'      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Reading systems failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 43,
                line: 1
              }
            ],
            message: 'Reading systems failed',
            path: [
              'systems'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the pagination values are out of range', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchSystemsPayload!) { systems(filters: $filters) { results { id ownerUserId name description } total } }',
        variables: {
          filters: {
            page: 0,
            pageSize: -1
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
                column: 43,
                line: 1
              }
            ],
            message: 'Bad Request Exception',
            path: [
              'systems'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the search parameters are the wrong type', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($filters: SearchSystemsPayload!) { systems(filters: $filters) { results { id ownerUserId name description } total } }',
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
            message: 'Variable "$filters" got invalid value { page: "a", pageSize: "a", searchText: [], extra: true }; Field "extra" is not defined by type "SearchSystemsPayload".'
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('REST GET /system', (): void => {
    it('returns a page of results with both filters', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));

      const response = await request(app.getHttpServer()).get('/system?page=2&pageSize=20&searchText=est&ownerUserIds[]=f9c7d036-e7e1-4775-b33c-43138e506e82');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (((("SystemEntity"."owner_user_id" IN ($1)) AND ("SystemEntity"."name" ILIKE $2))) OR ((("SystemEntity"."owner_user_id" IN ($3)) AND ("SystemEntity"."description" ILIKE $4)))) LIMIT 20 OFFSET 20', [        'f9c7d036-e7e1-4775-b33c-43138e506e82',        '%est%',        'f9c7d036-e7e1-4775-b33c-43138e506e82',        '%est%'      ], true);
      expect(response.body).toStrictEqual({
        results: [
          {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            name: 'TestSystem1',
            description: 'Test System 1'
          }
        ],
        total: 21
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results filtered by owner', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));

      const response = await request(app.getHttpServer()).get('/system?page=2&pageSize=20&ownerUserIds[]=f9c7d036-e7e1-4775-b33c-43138e506e82');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (((("SystemEntity"."owner_user_id" IN ($1))))) LIMIT 20 OFFSET 20', [        'f9c7d036-e7e1-4775-b33c-43138e506e82'      ], true);
      expect(response.body).toStrictEqual({
        results: [
          {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            name: 'TestSystem1',
            description: 'Test System 1'
          }
        ],
        total: 21
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results with a text filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));

      const response = await request(app.getHttpServer()).get('/system?page=2&pageSize=20&searchText=est');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (((("SystemEntity"."name" ILIKE $1))) OR ((("SystemEntity"."description" ILIKE $2)))) LIMIT 20 OFFSET 20', [        '%est%',        '%est%'      ], true);
      expect(response.body).toStrictEqual({
        results: [
          {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            name: 'TestSystem1',
            description: 'Test System 1'
          }
        ],
        total: 21
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('returns a page of results without a filter', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));

      const response = await request(app.getHttpServer()).get('/system?page=2&pageSize=20');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" LIMIT 20 OFFSET 20', [], true);
      expect(response.body).toStrictEqual({
        results: [
          {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            name: 'TestSystem1',
            description: 'Test System 1'
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

      const response = await request(app.getHttpServer()).get('/system?page=2&pageSize=20&searchText=est');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (((("SystemEntity"."name" ILIKE $1))) OR ((("SystemEntity"."description" ILIKE $2)))) LIMIT 20 OFFSET 20', [        '%est%',        '%est%'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT COUNT(1) AS "cnt" FROM "systems" "SystemEntity" WHERE (((("SystemEntity"."name" ILIKE $1))) OR ((("SystemEntity"."description" ILIKE $2))))', [        '%est%',        '%est%'      ], true);
      expect(response.body).toStrictEqual({
        results: [],
        total: 20
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 500 when the database system search fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get('/system?page=2&pageSize=20');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" LIMIT 20 OFFSET 20', [], true);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading systems failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the database system count fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get('/system?page=2&pageSize=20&searchText=est');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (((("SystemEntity"."name" ILIKE $1))) OR ((("SystemEntity"."description" ILIKE $2)))) LIMIT 20 OFFSET 20', [        '%est%',        '%est%'      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT COUNT(1) AS "cnt" FROM "systems" "SystemEntity" WHERE (((("SystemEntity"."name" ILIKE $1))) OR ((("SystemEntity"."description" ILIKE $2))))', [        '%est%',        '%est%'      ], true);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading systems failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the pagination values are out of range', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get('/system?page=0&pageSize=-1');

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
      const response = await request(app.getHttpServer()).get('/system?page=a&pageSize=a&ownerUserIds[]=not-a-uuid&extra=true');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        error: 'Bad Request',
        message: [
          'property extra should not exist',
          'page must not be less than 1',
          'page must be an integer number',
          'pageSize must not be less than 1',
          'pageSize must be an integer number',
          'each value in ownerUserIds must be a UUID'
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
