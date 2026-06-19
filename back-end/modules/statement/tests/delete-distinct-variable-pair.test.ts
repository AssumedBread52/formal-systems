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
const VAR1 = '11111111-e5f6-4778-9abc-def012345678';
const VAR2 = '22222222-e5f6-4778-9abc-def012345678';
const GUARD_SELECT = 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" = $1)) LIMIT 1';
const SELECT_BY_ID = 'SELECT "DistinctVariablePairEntity"."system_id" AS "DistinctVariablePairEntity_system_id", "DistinctVariablePairEntity"."statement_id" AS "DistinctVariablePairEntity_statement_id", "DistinctVariablePairEntity"."variable_symbol_1_id" AS "DistinctVariablePairEntity_variable_symbol_1_id", "DistinctVariablePairEntity"."variable_symbol_2_id" AS "DistinctVariablePairEntity_variable_symbol_2_id" FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity" WHERE (("DistinctVariablePairEntity"."system_id" = $1) AND ("DistinctVariablePairEntity"."statement_id" = $2) AND ("DistinctVariablePairEntity"."variable_symbol_1_id" = $3) AND ("DistinctVariablePairEntity"."variable_symbol_2_id" = $4)) LIMIT 1';
const VERIFY_OWNERSHIP = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1) AND ("SystemEntity"."owner_user_id" = $2))) LIMIT 1';
const PRELOAD = 'SELECT "DistinctVariablePairEntity"."system_id" AS "DistinctVariablePairEntity_system_id", "DistinctVariablePairEntity"."statement_id" AS "DistinctVariablePairEntity_statement_id", "DistinctVariablePairEntity"."variable_symbol_1_id" AS "DistinctVariablePairEntity_variable_symbol_1_id", "DistinctVariablePairEntity"."variable_symbol_2_id" AS "DistinctVariablePairEntity_variable_symbol_2_id" FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity" WHERE ((("DistinctVariablePairEntity"."statement_id" = $1 AND "DistinctVariablePairEntity"."variable_symbol_1_id" = $2 AND "DistinctVariablePairEntity"."variable_symbol_2_id" = $3)))';
const DELETE = 'DELETE FROM "statement_distinct_variable_pairs" WHERE ("statement_id" = $1 AND "variable_symbol_1_id" = $2 AND "variable_symbol_2_id" = $3)';

describe('Delete Distinct Variable Pair', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const guardUser = (): Record<string, unknown> => {
    return { UserEntity_id: USER, UserEntity_handle: 'Test1 User1', UserEntity_email: 'test1.user1@example.com', UserEntity_password_hash: hashSync('Test1User1!') };
  };

  const pairRow = (): Record<string, unknown> => {
    return {
      DistinctVariablePairEntity_system_id: SYSTEM,
      DistinctVariablePairEntity_statement_id: STATEMENT,
      DistinctVariablePairEntity_variable_symbol_1_id: VAR1,
      DistinctVariablePairEntity_variable_symbol_2_id: VAR2
    };
  };

  const removed = (): Record<string, unknown> => {
    return { systemId: SYSTEM, statementId: STATEMENT, variableSymbol1Id: VAR1, variableSymbol2Id: VAR2 };
  };

  const token = (): string => app.get(JwtService).sign({ userId: USER });

  const gql = (ids: { systemId?: string; statementId?: string; variableSymbol1Id?: string; variableSymbol2Id?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token()}`]).send({
      query: 'mutation ($systemId: String!, $statementId: String!, $variableSymbol1Id: String!, $variableSymbol2Id: String!) { deleteDistinctVariablePair(systemId: $systemId, statementId: $statementId, variableSymbol1Id: $variableSymbol1Id, variableSymbol2Id: $variableSymbol2Id) { systemId statementId variableSymbol1Id variableSymbol2Id } }',
      variables: { systemId: ids.systemId ?? SYSTEM, statementId: ids.statementId ?? STATEMENT, variableSymbol1Id: ids.variableSymbol1Id ?? VAR1, variableSymbol2Id: ids.variableSymbol2Id ?? VAR2 }
    });
  };

  const rest = (ids: { systemId?: string; statementId?: string; variableSymbol1Id?: string; variableSymbol2Id?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).delete(`/system/${ids.systemId ?? SYSTEM}/statement/${ids.statementId ?? STATEMENT}/distinct-variable-pair/${ids.variableSymbol1Id ?? VAR1}/${ids.variableSymbol2Id ?? VAR2}`).set('Cookie', [`token=${token()}`]);
  };

  const happyPath = (): void => {
    query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
    query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
    query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
    query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation deleteDistinctVariablePair', (): void => {
    it('deletes the distinct variable pair', async (): Promise<void> => {
      happyPath();

      const response = await gql();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(query).toHaveBeenNthCalledWith(2, SELECT_BY_ID, [SYSTEM, STATEMENT, VAR1, VAR2], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(4, PRELOAD, [STATEMENT, VAR1, VAR2], true);
      expect(query).toHaveBeenNthCalledWith(5, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(6, DELETE, [STATEMENT, VAR1, VAR2], true);
      expect(query).toHaveBeenNthCalledWith(7, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { deleteDistinctVariablePair: removed() } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('orders the variable symbol ids before deleting', async (): Promise<void> => {
      happyPath();

      const response = await gql({ variableSymbol1Id: VAR2, variableSymbol2Id: VAR1 });

      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(2, SELECT_BY_ID, [SYSTEM, STATEMENT, VAR1, VAR2], true);
      expect(query).toHaveBeenNthCalledWith(6, DELETE, [STATEMENT, VAR1, VAR2], true);
      expect(response.body).toStrictEqual({ data: { deleteDistinctVariablePair: removed() } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the distinct variable pair is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Distinct variable pair not found');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body.errors[0].message).toBe('User does not own the resource');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the delete fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql();

      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, DELETE, [STATEMENT, VAR1, VAR2], true);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Deleting distinct variable pair failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when a variable symbol id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ variableSymbol1Id: 'not-a-uuid' });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Validation failed (uuid is expected)');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($systemId: String!, $statementId: String!, $variableSymbol1Id: String!, $variableSymbol2Id: String!) { deleteDistinctVariablePair(systemId: $systemId, statementId: $statementId, variableSymbol1Id: $variableSymbol1Id, variableSymbol2Id: $variableSymbol2Id) { systemId } }',
        variables: { systemId: SYSTEM, statementId: STATEMENT, variableSymbol1Id: VAR1, variableSymbol2Id: VAR2 }
      });

      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].message).toBe('Unauthorized');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST DELETE /system/:systemId/statement/:statementId/distinct-variable-pair/:variableSymbol1Id/:variableSymbol2Id', (): void => {
    it('deletes the distinct variable pair', async (): Promise<void> => {
      happyPath();

      const response = await rest();

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(6, DELETE, [STATEMENT, VAR1, VAR2], true);
      expect(query).toHaveBeenNthCalledWith(7, 'COMMIT');
      expect(response.body).toStrictEqual(removed());
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when the distinct variable pair is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Distinct variable pair not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 403 when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({ error: 'Forbidden', message: 'User does not own the resource', statusCode: HttpStatus.FORBIDDEN });
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('responds with 500 when the delete fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest();

      expect(query).toHaveBeenCalledTimes(7);
      expect(query).toHaveBeenNthCalledWith(7, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Internal Server Error', message: 'Deleting distinct variable pair failed', statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 400 when a variable symbol id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ variableSymbol2Id: 'not-a-uuid' });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 401 when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).delete(`/system/${SYSTEM}/statement/${STATEMENT}/distinct-variable-pair/${VAR1}/${VAR2}`);

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
