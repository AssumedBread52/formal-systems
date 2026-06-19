import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

const SYSTEM = 'ebe1615e-8c75-461a-b6f4-29db73a14ee7';
const STATEMENT = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const HYPOTHESIS = 'b2c3d4e5-f6a7-4889-9abc-def012345678';
const EXPRESSION = 'c3d4e5f6-a7b8-499a-9abc-def012345678';
const SELECT_BY_ID = 'SELECT "HypothesisEntity"."id" AS "HypothesisEntity_id", "HypothesisEntity"."system_id" AS "HypothesisEntity_system_id", "HypothesisEntity"."statement_id" AS "HypothesisEntity_statement_id", "HypothesisEntity"."expression_id" AS "HypothesisEntity_expression_id", "HypothesisEntity"."type" AS "HypothesisEntity_type" FROM "statement_hypotheses" "HypothesisEntity" WHERE (("HypothesisEntity"."id" = $1) AND ("HypothesisEntity"."system_id" = $2) AND ("HypothesisEntity"."statement_id" = $3)) LIMIT 1';

describe('Read Hypothesis by ID', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const hypothesisRow = (): Record<string, unknown> => {
    return {
      HypothesisEntity_id: HYPOTHESIS,
      HypothesisEntity_system_id: SYSTEM,
      HypothesisEntity_statement_id: STATEMENT,
      HypothesisEntity_expression_id: EXPRESSION,
      HypothesisEntity_type: 'logic'
    };
  };

  const result = (): Record<string, unknown> => {
    return { id: HYPOTHESIS, systemId: SYSTEM, statementId: STATEMENT, expressionId: EXPRESSION, type: 'logic' };
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query hypothesis', (): void => {
    const send = (variables: Record<string, unknown>): request.Test => {
      return request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!, $statementId: String!, $hypothesisId: String!) { hypothesis(systemId: $systemId, statementId: $statementId, hypothesisId: $hypothesisId) { id systemId statementId expressionId type } }',
        variables
      });
    };

    it('returns the requested hypothesis', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow()]));

      const response = await send({ systemId: SYSTEM, statementId: STATEMENT, hypothesisId: HYPOTHESIS });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [HYPOTHESIS, SYSTEM, STATEMENT], true);
      expect(response.body).toStrictEqual({ data: { hypothesis: result() } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no hypothesis matches', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send({ systemId: SYSTEM, statementId: STATEMENT, hypothesisId: HYPOTHESIS });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Hypothesis not found');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the database read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await send({ systemId: SYSTEM, statementId: STATEMENT, hypothesisId: HYPOTHESIS });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Reading hypothesis failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the hypothesis id is not a UUID', async (): Promise<void> => {
      const response = await send({ systemId: SYSTEM, statementId: STATEMENT, hypothesisId: 'not-a-uuid' });

      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Validation failed (uuid is expected)');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST GET /system/:systemId/statement/:statementId/hypothesis/:hypothesisId', (): void => {
    it('returns the requested hypothesis', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow()]));

      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/statement/${STATEMENT}/hypothesis/${HYPOTHESIS}`);

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [HYPOTHESIS, SYSTEM, STATEMENT], true);
      expect(response.body).toStrictEqual(result());
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when no hypothesis matches', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/statement/${STATEMENT}/hypothesis/${HYPOTHESIS}`);

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Hypothesis not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 500 when the database read fails', async (): Promise<void> => {
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/statement/${STATEMENT}/hypothesis/${HYPOTHESIS}`);

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Reading hypothesis failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when the statement id is not a UUID', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).get(`/system/${SYSTEM}/statement/not-a-uuid/hypothesis/${HYPOTHESIS}`);

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
