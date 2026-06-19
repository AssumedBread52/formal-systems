import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import request from 'supertest';

const GUARD_SELECT = 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1';
const SELECT_BY_ID = 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1';
const VERIFY_OWNERSHIP = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1) AND ("SystemEntity"."owner_user_id" = $2))) LIMIT 1';
const VERIFY_NOT_IN_USE = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "systems" "SystemEntity" LEFT JOIN "symbols" "SystemEntity__SystemEntity_symbols" ON "SystemEntity__SystemEntity_symbols"."system_id"="SystemEntity"."id"  LEFT JOIN "expressions" "SystemEntity__SystemEntity_expressions" ON "SystemEntity__SystemEntity_expressions"."system_id"="SystemEntity"."id" WHERE (((("SystemEntity"."id" = $1) AND (((NOT("SystemEntity__SystemEntity_symbols"."id" IS NULL)))))) OR ((("SystemEntity"."id" = $2) AND (((NOT("SystemEntity__SystemEntity_expressions"."id" IS NULL)))))))) LIMIT 1';
const PRELOAD = 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE "SystemEntity"."id" IN ($1)';

describe('Delete System', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const guardUser = (): Record<string, unknown> => {
    return {
      UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
      UserEntity_handle: 'Test1 User1',
      UserEntity_email: 'test1.user1@example.com',
      UserEntity_password_hash: hashSync('Test1User1!')
    };
  };

  const systemRow = (): Record<string, unknown> => {
    return {
      SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
      SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
      SystemEntity_name: 'TestSystem1',
      SystemEntity_description: 'Test System 1'
    };
  };

  const token = (): string => {
    return app.get(JwtService).sign({
      userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
    });
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation deleteSystem', (): void => {
    it('deletes the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, SELECT_BY_ID, [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_NOT_IN_USE, [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, PRELOAD, [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(7, 'DELETE FROM "systems" WHERE "id" = $1', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(8, 'COMMIT');
      expect(response.body).toStrictEqual({
        data: {
          deleteSystem: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
            name: 'TestSystem1',
            description: 'Test System 1'
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the system is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, SELECT_BY_ID, [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Not Found',
                message: 'System not found',
                statusCode: HttpStatus.NOT_FOUND
              },
              status: HttpStatus.NOT_FOUND
            },
            locations: [
              {
                column: 33,
                line: 1
              }
            ],
            message: 'System not found',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'FORBIDDEN',
              originalError: {
                error: 'Forbidden',
                message: 'User does not own the resource',
                statusCode: HttpStatus.FORBIDDEN
              }
            },
            locations: [
              {
                column: 33,
                line: 1
              }
            ],
            message: 'User does not own the resource',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the ownership check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Verifying ownership failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 33,
                line: 1
              }
            ],
            message: 'Verifying ownership failed',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the system is in use', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_NOT_IN_USE, [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Conflict',
                message: 'System is in use',
                statusCode: HttpStatus.CONFLICT
              },
              status: HttpStatus.CONFLICT
            },
            locations: [
              {
                column: 33,
                line: 1
              }
            ],
            message: 'System is in use',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the in-use check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Verifying system not in use failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 33,
                line: 1
              }
            ],
            message: 'Verifying system not in use failed',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the start transaction fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Deleting system failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 33,
                line: 1
              }
            ],
            message: 'Deleting system failed',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the start transaction and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Deleting system failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 33,
                line: 1
              }
            ],
            message: 'Deleting system failed',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the delete fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(7, 'DELETE FROM "systems" WHERE "id" = $1', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Deleting system failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 33,
                line: 1
              }
            ],
            message: 'Deleting system failed',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the delete and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Deleting system failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 33,
                line: 1
              }
            ],
            message: 'Deleting system failed',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the commit fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(8, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Deleting system failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 33,
                line: 1
              }
            ],
            message: 'Deleting system failed',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the commit and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(8, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Deleting system failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 33,
                line: 1
              }
            ],
            message: 'Deleting system failed',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'not-a-uuid'
        }
      });

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
                message: 'Validation failed (uuid is expected)',
                statusCode: HttpStatus.BAD_REQUEST
              }
            },
            locations: [
              {
                column: 33,
                line: 1
              }
            ],
            message: 'Validation failed (uuid is expected)',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the session user is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
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
                column: 33,
                line: 1
              }
            ],
            message: 'Invalid token',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token()}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
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
                column: 33,
                line: 1
              }
            ],
            message: 'Invalid token',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the token payload has extra fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        extra: true
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
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
                column: 33,
                line: 1
              }
            ],
            message: 'Invalid token',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the token payload has invalid fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({
        userId: 'not-a-uuid'
      });

      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        `token=${token}`
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
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
                column: 33,
                line: 1
              }
            ],
            message: 'Invalid token',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the token cookie is not a JWT', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
        'token=not-a-jwt'
      ]).send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
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
                column: 33,
                line: 1
              }
            ],
            message: 'Unauthorized',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
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
                column: 33,
                line: 1
              }
            ],
            message: 'Unauthorized',
            path: [
              'deleteSystem'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST DELETE /system/:systemId', (): void => {
    it('deletes the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        `token=${token()}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, SELECT_BY_ID, [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_NOT_IN_USE, [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(5, PRELOAD, [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(7, 'DELETE FROM "systems" WHERE "id" = $1', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(8, 'COMMIT');
      expect(response.body).toStrictEqual({
        id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
        ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        name: 'TestSystem1',
        description: 'Test System 1'
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when the system is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        `token=${token()}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, SELECT_BY_ID, [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Not Found',
        message: 'System not found',
        statusCode: HttpStatus.NOT_FOUND
      });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 403 when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        `token=${token()}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Forbidden',
        message: 'User does not own the resource',
        statusCode: HttpStatus.FORBIDDEN
      });
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('responds with 500 when the ownership check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        `token=${token()}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Verifying ownership failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 409 when the system is in use', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        `token=${token()}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_NOT_IN_USE, [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Conflict',
        message: 'System is in use',
        statusCode: HttpStatus.CONFLICT
      });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('responds with 500 when the in-use check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        `token=${token()}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Verifying system not in use failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the start transaction fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        `token=${token()}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Deleting system failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the start transaction and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        `token=${token()}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Deleting system failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the delete fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        `token=${token()}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(7, 'DELETE FROM "systems" WHERE "id" = $1', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Deleting system failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the delete and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        `token=${token()}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(8);
      expect(query).toHaveBeenNthCalledWith(8, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Deleting system failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the commit fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        `token=${token()}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(8, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Deleting system failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the commit and rollback fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([systemRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        `token=${token()}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(8, 'COMMIT');
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Deleting system failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await request(app.getHttpServer()).delete('/system/not-a-uuid').set('Cookie', [
        `token=${token()}`
      ]);

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

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        `token=${token()}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        error: 'Unauthorized',
        message: 'Invalid token',
        statusCode: HttpStatus.UNAUTHORIZED
      });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        `token=${token()}`
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        error: 'Unauthorized',
        message: 'Invalid token',
        statusCode: HttpStatus.UNAUTHORIZED
      });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when the token payload has extra fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({
        userId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        extra: true
      });

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
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
    });

    it('responds with 401 when the token payload has invalid fields', async (): Promise<void> => {
      const token = app.get(JwtService).sign({
        userId: 'not-a-uuid'
      });

      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
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
    });

    it('responds with 401 when the token cookie is not a JWT', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7').set('Cookie', [
        'token=not-a-jwt'
      ]);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        message: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED
      });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('responds with 401 when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).delete('/system/ebe1615e-8c75-461a-b6f4-29db73a14ee7');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        message: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED
      });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
