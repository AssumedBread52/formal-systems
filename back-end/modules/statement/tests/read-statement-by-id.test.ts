import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

const SYSTEM = 'ebe1615e-8c75-461a-b6f4-29db73a14ee7';
const STATEMENT = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const EXPRESSION = 'b2c3d4e5-f6a7-4889-9abc-def012345678';
const SELECT_BY_ID = 'SELECT "StatementEntity"."id" AS "StatementEntity_id", "StatementEntity"."system_id" AS "StatementEntity_system_id", "StatementEntity"."assertion_expression_id" AS "StatementEntity_assertion_expression_id", "StatementEntity"."name" AS "StatementEntity_name", "StatementEntity"."description" AS "StatementEntity_description" FROM "statements" "StatementEntity" WHERE (("StatementEntity"."id" = $1) AND ("StatementEntity"."system_id" = $2)) LIMIT 1';
const COLUMN = 53;

describe('Read Statement by ID', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const statementRow = (): Record<string, unknown> => {
    return {
      StatementEntity_id: STATEMENT,
      StatementEntity_system_id: SYSTEM,
      StatementEntity_assertion_expression_id: EXPRESSION,
      StatementEntity_name: 'TestStatement1',
      StatementEntity_description: 'Test Statement 1'
    };
  };

  const result = (): Record<string, unknown> => {
    return {
      id: STATEMENT,
      systemId: SYSTEM,
      assertionExpressionId: EXPRESSION,
      name: 'TestStatement1',
      description: 'Test Statement 1'
    };
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query statement', (): void => {
    const send = (variables: Record<string, unknown>): request.Test => {
      return request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $statementId: String!) { statement(systemId: $systemId, statementId: $statementId) { id systemId assertionExpressionId name description } }',
        variables
      });
    };

    it('returns the requested statement', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));

      const response = await send({ systemId: SYSTEM, statementId: STATEMENT });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [STATEMENT, SYSTEM], true);
      expect(response.body).toStrictEqual({ data: { statement: result() } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no statement matches', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send({ systemId: SYSTEM, statementId: STATEMENT });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: { error: 'Not Found', message: 'Statement not found', statusCode: HttpStatus.NOT_FOUND },
              status: HttpStatus.NOT_FOUND
            },
            locations: [{ column: COLUMN, line: 1 }],
            message: 'Statement not found',
            path: ['statement']
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await send({ systemId: SYSTEM, statementId: STATEMENT });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Reading statement failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the system id is not a UUID', async (): Promise<void> => {
      const response = await send({ systemId: 'not-a-uuid', statementId: STATEMENT });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Validation failed (uuid is expected)');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the statement id is not a UUID', async (): Promise<void> => {
      const response = await send({ systemId: SYSTEM, statementId: 'not-a-uuid' });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Validation failed (uuid is expected)');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST GET /system/:systemId/statement/:statementId', (): void => {
    it('returns the requested statement', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([statementRow()]));

      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/statement/${STATEMENT}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [STATEMENT, SYSTEM], true);
      expect(response.body).toStrictEqual(result());
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when no statement matches', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/statement/${STATEMENT}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Statement not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 500 when the database read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/statement/${STATEMENT}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Reading statement failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the system id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get(`/system/not-a-uuid/statement/${STATEMENT}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the statement id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/statement/not-a-uuid`);

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
