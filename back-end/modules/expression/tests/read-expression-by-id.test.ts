import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

const SYSTEM = 'ebe1615e-8c75-461a-b6f4-29db73a14ee7';
const EXPRESSION = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const SYMBOL = 'b2c3d4e5-f6a7-4889-9abc-def012345678';
const SELECT_BY_ID = 'SELECT "ExpressionEntity"."id" AS "ExpressionEntity_id", "ExpressionEntity"."system_id" AS "ExpressionEntity_system_id", "ExpressionEntity"."canonical" AS "ExpressionEntity_canonical" FROM "expressions" "ExpressionEntity" WHERE (("ExpressionEntity"."id" = $1) AND ("ExpressionEntity"."system_id" = $2)) LIMIT 1';

describe('Read Expression by ID', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const expressionRow = (): Record<string, unknown> => {
    return {
      ExpressionEntity_id: EXPRESSION,
      ExpressionEntity_system_id: SYSTEM,
      ExpressionEntity_canonical: [SYMBOL]
    };
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query expression', (): void => {
    it('returns the requested expression', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $expressionId: String!) { expression(systemId: $systemId, expressionId: $expressionId) { id systemId canonical } }',
        variables: { systemId: SYSTEM, expressionId: EXPRESSION }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [EXPRESSION, SYSTEM], true);
      expect(response.body).toStrictEqual({
        data: {
          expression: {
            id: EXPRESSION,
            systemId: SYSTEM,
            canonical: [SYMBOL]
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no expression matches', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $expressionId: String!) { expression(systemId: $systemId, expressionId: $expressionId) { id systemId canonical } }',
        variables: { systemId: SYSTEM, expressionId: EXPRESSION }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [EXPRESSION, SYSTEM], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: { error: 'Not Found', message: 'Expression not found', statusCode: HttpStatus.NOT_FOUND },
              status: HttpStatus.NOT_FOUND
            },
            locations: [{ column: 54, line: 1 }],
            message: 'Expression not found',
            path: ['expression']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $expressionId: String!) { expression(systemId: $systemId, expressionId: $expressionId) { id systemId canonical } }',
        variables: { systemId: SYSTEM, expressionId: EXPRESSION }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [EXPRESSION, SYSTEM], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: { error: 'Internal Server Error', message: 'Reading expression failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [{ column: 54, line: 1 }],
            message: 'Reading expression failed',
            path: ['expression']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the system id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $expressionId: String!) { expression(systemId: $systemId, expressionId: $expressionId) { id systemId canonical } }',
        variables: { systemId: 'not-a-uuid', expressionId: EXPRESSION }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'BAD_REQUEST',
              originalError: { error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST }
            },
            locations: [{ column: 54, line: 1 }],
            message: 'Validation failed (uuid is expected)',
            path: ['expression']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the expression id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $expressionId: String!) { expression(systemId: $systemId, expressionId: $expressionId) { id systemId canonical } }',
        variables: { systemId: SYSTEM, expressionId: 'not-a-uuid' }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'BAD_REQUEST',
              originalError: { error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST }
            },
            locations: [{ column: 54, line: 1 }],
            message: 'Validation failed (uuid is expected)',
            path: ['expression']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST GET /system/:systemId/expression/:expressionId', (): void => {
    it('returns the requested expression', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));

      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/expression/${EXPRESSION}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [EXPRESSION, SYSTEM], true);
      expect(response.body).toStrictEqual({
        id: EXPRESSION,
        systemId: SYSTEM,
        canonical: [SYMBOL]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when no expression matches', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/expression/${EXPRESSION}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [EXPRESSION, SYSTEM], true);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Expression not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 500 when the database read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/expression/${EXPRESSION}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [EXPRESSION, SYSTEM], true);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Reading expression failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the system id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get(`/system/not-a-uuid/expression/${EXPRESSION}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the expression id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/expression/not-a-uuid`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
