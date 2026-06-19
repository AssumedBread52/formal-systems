import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import request from 'supertest';

const USER = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
const SYSTEM = 'ebe1615e-8c75-461a-b6f4-29db73a14ee7';
const STATEMENT = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const HYPOTHESIS = 'b2c3d4e5-f6a7-4889-9abc-def012345678';
const EXPRESSION = 'c3d4e5f6-a7b8-499a-9abc-def012345678';
const GUARD_SELECT = 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1';
const SELECT_BY_ID = 'SELECT "HypothesisEntity"."id" AS "HypothesisEntity_id", "HypothesisEntity"."system_id" AS "HypothesisEntity_system_id", "HypothesisEntity"."statement_id" AS "HypothesisEntity_statement_id", "HypothesisEntity"."expression_id" AS "HypothesisEntity_expression_id", "HypothesisEntity"."type" AS "HypothesisEntity_type" FROM "statement_hypotheses" "HypothesisEntity" WHERE (("HypothesisEntity"."id" = $1) AND ("HypothesisEntity"."system_id" = $2) AND ("HypothesisEntity"."statement_id" = $3)) LIMIT 1';
const VERIFY_OWNERSHIP = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1) AND ("SystemEntity"."owner_user_id" = $2))) LIMIT 1';
const PRELOAD = 'SELECT "HypothesisEntity"."id" AS "HypothesisEntity_id", "HypothesisEntity"."system_id" AS "HypothesisEntity_system_id", "HypothesisEntity"."statement_id" AS "HypothesisEntity_statement_id", "HypothesisEntity"."expression_id" AS "HypothesisEntity_expression_id", "HypothesisEntity"."type" AS "HypothesisEntity_type" FROM "statement_hypotheses" "HypothesisEntity" WHERE "HypothesisEntity"."id" IN ($1)';
const DELETE = 'DELETE FROM "statement_hypotheses" WHERE "id" = $1';

describe('Delete Hypothesis', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const guardUser = (): Record<string, unknown> => {
    return { UserEntity_id: USER, UserEntity_handle: 'Test1 User1', UserEntity_email: 'test1.user1@example.com', UserEntity_password_hash: hashSync('Test1User1!') };
  };

  const hypothesisRow = (type: string): Record<string, unknown> => {
    return { HypothesisEntity_id: HYPOTHESIS, HypothesisEntity_system_id: SYSTEM, HypothesisEntity_statement_id: STATEMENT, HypothesisEntity_expression_id: EXPRESSION, HypothesisEntity_type: type };
  };

  const removed = (type: string): Record<string, unknown> => {
    return { id: HYPOTHESIS, systemId: SYSTEM, statementId: STATEMENT, expressionId: EXPRESSION, type };
  };

  const token = (): string => app.get(JwtService).sign({ userId: USER });

  const gql = (ids: { systemId?: string; statementId?: string; hypothesisId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token()}`]).send({
      query: 'mutation ($systemId: String!, $statementId: String!, $hypothesisId: String!) { deleteHypothesis(systemId: $systemId, statementId: $statementId, hypothesisId: $hypothesisId) { id systemId statementId expressionId type } }',
      variables: { systemId: ids.systemId ?? SYSTEM, statementId: ids.statementId ?? STATEMENT, hypothesisId: ids.hypothesisId ?? HYPOTHESIS }
    });
  };

  const rest = (ids: { systemId?: string; statementId?: string; hypothesisId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).delete(`/system/${ids.systemId ?? SYSTEM}/statement/${ids.statementId ?? STATEMENT}/hypothesis/${ids.hypothesisId ?? HYPOTHESIS}`).set('Cookie', [`token=${token()}`]);
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation deleteHypothesis', (): void => {
    it('deletes a logic hypothesis', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow('logic')]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow('logic')]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(query).toHaveBeenNthCalledWith(2, SELECT_BY_ID, [HYPOTHESIS, SYSTEM, STATEMENT], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(4, PRELOAD, [HYPOTHESIS], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, DELETE, [HYPOTHESIS], true);
      expect(query).toHaveBeenNthCalledWith(7, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { deleteHypothesis: removed('logic') } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('deletes a type hypothesis after checking it is not in use', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow('type')]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow('type')]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(4, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(5, 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      expect(query.mock.calls[5]![0]).toContain('FROM "statement_hypotheses" "HypothesisEntity"');
      expect(query.mock.calls[5]![1]).toStrictEqual([HYPOTHESIS, 'type', 1, STATEMENT, 'logic', STATEMENT, STATEMENT, STATEMENT]);
      expect(query).toHaveBeenNthCalledWith(7, PRELOAD, [HYPOTHESIS], true);
      expect(query).toHaveBeenNthCalledWith(8, DELETE, [HYPOTHESIS], true);
      expect(query).toHaveBeenNthCalledWith(9, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { deleteHypothesis: removed('type') } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the hypothesis is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Hypothesis not found');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow('logic')]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body.errors[0].message).toBe('User does not own the resource');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when a type hypothesis is in use', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow('type')]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Type hypothesis in use');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.CONFLICT);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the in-use check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow('type')]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying type hypothesis not in use failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when deleting a logic hypothesis fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow('logic')]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow('logic')]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, DELETE, [HYPOTHESIS], true);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting hypothesis failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the statement id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ statementId: 'not-a-uuid' });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Validation failed (uuid is expected)');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($systemId: String!, $statementId: String!, $hypothesisId: String!) { deleteHypothesis(systemId: $systemId, statementId: $statementId, hypothesisId: $hypothesisId) { id } }',
        variables: { systemId: SYSTEM, statementId: STATEMENT, hypothesisId: HYPOTHESIS }
      });

      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].message).toBe('Unauthorized');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST DELETE /system/:systemId/statement/:statementId/hypothesis/:hypothesisId', (): void => {
    it('deletes a logic hypothesis', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow('logic')]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow('logic')]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, DELETE, [HYPOTHESIS], true);
      expect(query).toHaveBeenNthCalledWith(7, 'COMMIT');
      expect(response.body).toStrictEqual(removed('logic'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when the hypothesis is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Hypothesis not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 403 when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow('logic')]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({ error: 'Forbidden', message: 'User does not own the resource', statusCode: HttpStatus.FORBIDDEN });
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('responds with 409 when a type hypothesis is in use', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([hypothesisRow('type')]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Conflict', message: 'Type hypothesis in use', statusCode: HttpStatus.CONFLICT });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('responds with 400 when the hypothesis id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ hypothesisId: 'not-a-uuid' });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 401 when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).delete(`/system/${SYSTEM}/statement/${STATEMENT}/hypothesis/${HYPOTHESIS}`);

      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body).toStrictEqual({ message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
