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
const VERIFY_OWNERSHIP = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1) AND ("SystemEntity"."owner_user_id" = $2))) LIMIT 1';
const VERIFY_ALL_EXIST = 'SELECT COUNT(1) AS "cnt" FROM "symbols" "SymbolEntity" WHERE (("SymbolEntity"."id" IN ($1, $2)) AND ("SymbolEntity"."system_id" = $3))';
const VERIFY_STATEMENT_EXISTS = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "statements" "StatementEntity" WHERE (("StatementEntity"."id" = $1) AND ("StatementEntity"."system_id" = $2))) LIMIT 1';
const VERIFY_UNIQUE_PAIR = 'SELECT 1 AS "row_exists" FROM (SELECT 1 AS dummy_column) "dummy_table" WHERE EXISTS (SELECT 1 FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity" WHERE (("DistinctVariablePairEntity"."statement_id" = $1) AND ("DistinctVariablePairEntity"."variable_symbol_1_id" = $2) AND ("DistinctVariablePairEntity"."variable_symbol_2_id" = $3))) LIMIT 1';
const VERIFY_SYMBOL_TYPE = 'SELECT COUNT(1) AS "cnt" FROM "symbols" "SymbolEntity" WHERE (("SymbolEntity"."id" IN ($1, $2)) AND ("SymbolEntity"."system_id" = $3) AND ("SymbolEntity"."type" = $4))';
const VERIFY_ALL_SYMBOLS_TYPED = 'SELECT COUNT(DISTINCT("SymbolEntity"."id")) AS "cnt" FROM "symbols" "SymbolEntity" LEFT JOIN "expression_tokens" "SymbolEntity__SymbolEntity_expressionTokens" ON "SymbolEntity__SymbolEntity_expressionTokens"."system_id"="SymbolEntity"."system_id" AND "SymbolEntity__SymbolEntity_expressionTokens"."symbol_id"="SymbolEntity"."id"  LEFT JOIN "expressions" "e215cd75db3b02651976a7790f9339f077972236" ON "e215cd75db3b02651976a7790f9339f077972236"."system_id"="SymbolEntity__SymbolEntity_expressionTokens"."system_id" AND "e215cd75db3b02651976a7790f9339f077972236"."id"="SymbolEntity__SymbolEntity_expressionTokens"."expression_id"  LEFT JOIN "statement_hypotheses" "331d1564e574365a7ece9f64e9e90d98bd787d98" ON "331d1564e574365a7ece9f64e9e90d98bd787d98"."system_id"="e215cd75db3b02651976a7790f9339f077972236"."system_id" AND "331d1564e574365a7ece9f64e9e90d98bd787d98"."expression_id"="e215cd75db3b02651976a7790f9339f077972236"."id" WHERE (("SymbolEntity"."id" IN ($1, $2)) AND ("SymbolEntity"."system_id" = $3) AND ((("SymbolEntity__SymbolEntity_expressionTokens"."position" = $4) AND (((((\"331d1564e574365a7ece9f64e9e90d98bd787d98\".\"statement_id\" = $5) AND (\"331d1564e574365a7ece9f64e9e90d98bd787d98\".\"type\" = $6))))))))';
const DVP_PRELOAD = 'SELECT "DistinctVariablePairEntity"."system_id" AS "DistinctVariablePairEntity_system_id", "DistinctVariablePairEntity"."statement_id" AS "DistinctVariablePairEntity_statement_id", "DistinctVariablePairEntity"."variable_symbol_1_id" AS "DistinctVariablePairEntity_variable_symbol_1_id", "DistinctVariablePairEntity"."variable_symbol_2_id" AS "DistinctVariablePairEntity_variable_symbol_2_id" FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity" WHERE ((("DistinctVariablePairEntity"."statement_id" = $1 AND "DistinctVariablePairEntity"."variable_symbol_1_id" = $2 AND "DistinctVariablePairEntity"."variable_symbol_2_id" = $3)))';
const INSERT_DVP = 'INSERT INTO "statement_distinct_variable_pairs"("system_id", "statement_id", "variable_symbol_1_id", "variable_symbol_2_id") VALUES ($1, $2, $3, $4)';

describe('Create Distinct Variable Pair', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const guardUser = (): Record<string, unknown> => {
    return { UserEntity_id: USER, UserEntity_handle: 'Test1 User1', UserEntity_email: 'test1.user1@example.com', UserEntity_password_hash: hashSync('Test1User1!') };
  };

  const token = (): string => app.get(JwtService).sign({ userId: USER });

  const gql = (distinctVariablePairPayload: Record<string, unknown>, ids: { systemId?: string; statementId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).post('/graphql').set('Cookie', [`token=${token()}`]).send({
      query: 'mutation ($systemId: String!, $statementId: String!, $distinctVariablePairPayload: NewDistinctVariablePairPayload!) { createDistinctVariablePair(systemId: $systemId, statementId: $statementId, distinctVariablePairPayload: $distinctVariablePairPayload) { systemId statementId variableSymbol1Id variableSymbol2Id } }',
      variables: { systemId: ids.systemId ?? SYSTEM, statementId: ids.statementId ?? STATEMENT, distinctVariablePairPayload }
    });
  };

  const rest = (body: Record<string, unknown>, ids: { systemId?: string; statementId?: string; } = {}): request.Test => {
    return request(app.getHttpServer()).post(`/system/${ids.systemId ?? SYSTEM}/statement/${ids.statementId ?? STATEMENT}/distinct-variable-pair`).set('Cookie', [`token=${token()}`]).send(body);
  };

  const validPayload = (): Record<string, unknown> => {
    return { variableSymbol1Id: VAR1, variableSymbol2Id: VAR2 };
  };

  const created = (): Record<string, unknown> => {
    return { systemId: SYSTEM, statementId: STATEMENT, variableSymbol1Id: VAR1, variableSymbol2Id: VAR2 };
  };

  const happyPath = (): void => {
    query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
    query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
    query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
    query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
    query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
    query.mockResolvedValueOnce(buildQueryResult([]));
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql mutation createDistinctVariablePair', (): void => {
    it('creates the distinct variable pair', async (): Promise<void> => {
      happyPath();

      const response = await gql(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(1, GUARD_SELECT, [USER], true);
      expect(query).toHaveBeenNthCalledWith(2, VERIFY_OWNERSHIP, [SYSTEM, USER], true);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_ALL_EXIST, [VAR1, VAR2, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_STATEMENT_EXISTS, [STATEMENT, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(5, VERIFY_UNIQUE_PAIR, [STATEMENT, VAR1, VAR2], true);
      expect(query).toHaveBeenNthCalledWith(6, 'START TRANSACTION');
      expect(query).toHaveBeenNthCalledWith(7, 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      expect(query).toHaveBeenNthCalledWith(8, VERIFY_SYMBOL_TYPE, [VAR1, VAR2, SYSTEM, 'variable'], true);
      expect(query).toHaveBeenNthCalledWith(9, VERIFY_ALL_SYMBOLS_TYPED, [VAR1, VAR2, SYSTEM, 1, STATEMENT, 'type'], true);
      expect(query).toHaveBeenNthCalledWith(10, DVP_PRELOAD, [STATEMENT, VAR1, VAR2], true);
      expect(query).toHaveBeenNthCalledWith(11, INSERT_DVP, [SYSTEM, STATEMENT, VAR1, VAR2], true);
      expect(query).toHaveBeenNthCalledWith(12, 'COMMIT');
      expect(response.body).toStrictEqual({ data: { createDistinctVariablePair: created() } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the variable symbol ids are not distinct', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await gql({ variableSymbol1Id: VAR1, variableSymbol2Id: VAR1 });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Variable symbol IDs must be distinct');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body.errors[0].message).toBe('User does not own the resource');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when a symbol does not exist', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, VERIFY_ALL_EXIST, [VAR1, VAR2, SYSTEM], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Symbol not found');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the statement does not exist', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(4);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Statement not found');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the pair already exists', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(5, VERIFY_UNIQUE_PAIR, [STATEMENT, VAR1, VAR2], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Distinct variable pairs attached to a statement must be unique');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.CONFLICT);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when a symbol is not a variable', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(8, VERIFY_SYMBOL_TYPE, [VAR1, VAR2, SYSTEM, 'variable'], true);
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Symbol has an invalid type');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the symbol type verification fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(8, VERIFY_SYMBOL_TYPE, [VAR1, VAR2, SYSTEM, 'variable'], true);
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying symbol type failed');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when a variable symbol is not typed', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(10);
      expect(query).toHaveBeenNthCalledWith(9, VERIFY_ALL_SYMBOLS_TYPED, [VAR1, VAR2, SYSTEM, 1, STATEMENT, 'type'], true);
      expect(query).toHaveBeenNthCalledWith(10, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('At least one variable symbol does not have a corresponding type hypothesis');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the statement existence check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(4);
      expect(query).toHaveBeenNthCalledWith(4, VERIFY_STATEMENT_EXISTS, [STATEMENT, SYSTEM], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying statement existence failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the unique variable pair check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockRejectedValueOnce(new Error());

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(5);
      expect(query).toHaveBeenNthCalledWith(5, VERIFY_UNIQUE_PAIR, [STATEMENT, VAR1, VAR2], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying unique variable pair failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the typed-symbols check fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(10);
      expect(query).toHaveBeenNthCalledWith(9, VERIFY_ALL_SYMBOLS_TYPED, [VAR1, VAR2, SYSTEM, 1, STATEMENT, 'type'], true);
      expect(query).toHaveBeenNthCalledWith(10, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Verifying all symbols are typed failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the insert fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockRejectedValueOnce(new Error());
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await gql(validPayload());

      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(11, INSERT_DVP, [SYSTEM, STATEMENT, VAR1, VAR2], true);
      expect(query).toHaveBeenNthCalledWith(12, 'ROLLBACK');
      expect(response.body.errors[0].extensions.originalError.message).toBe('Creating distinct variable pair failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'mutation ($systemId: String!, $statementId: String!, $distinctVariablePairPayload: NewDistinctVariablePairPayload!) { createDistinctVariablePair(systemId: $systemId, statementId: $statementId, distinctVariablePairPayload: $distinctVariablePairPayload) { systemId } }',
        variables: { systemId: SYSTEM, statementId: STATEMENT, distinctVariablePairPayload: validPayload() }
      });

      expect(query).toHaveBeenCalledTimes(0);
      expect(response.body.errors[0].message).toBe('Unauthorized');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST POST /system/:systemId/statement/:statementId/distinct-variable-pair', (): void => {
    it('creates the distinct variable pair', async (): Promise<void> => {
      happyPath();

      const response = await rest(validPayload());

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(12);
      expect(query).toHaveBeenNthCalledWith(9, VERIFY_ALL_SYMBOLS_TYPED, [VAR1, VAR2, SYSTEM, 1, STATEMENT, 'type'], true);
      expect(query).toHaveBeenNthCalledWith(11, INSERT_DVP, [SYSTEM, STATEMENT, VAR1, VAR2], true);
      expect(query).toHaveBeenNthCalledWith(12, 'COMMIT');
      expect(response.body).toStrictEqual(created());
      expect(response.statusCode).toBe(HttpStatus.CREATED);
    });

    it('responds with 422 when the variable symbol ids are not distinct', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ variableSymbol1Id: VAR1, variableSymbol2Id: VAR1 });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Unprocessable Entity', message: 'Variable symbol IDs must be distinct', statusCode: HttpStatus.UNPROCESSABLE_ENTITY });
      expect(response.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('responds with 403 when the user does not own the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({ error: 'Forbidden', message: 'User does not own the resource', statusCode: HttpStatus.FORBIDDEN });
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('responds with 404 when a symbol does not exist', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));

      const response = await rest(validPayload());

      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body).toStrictEqual({ error: 'Not Found', message: 'Symbol not found', statusCode: HttpStatus.NOT_FOUND });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 409 when the pair already exists', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));

      const response = await rest(validPayload());

      expect(query).toHaveBeenCalledTimes(5);
      expect(response.body).toStrictEqual({ error: 'Conflict', message: 'Distinct variable pairs attached to a statement must be unique', statusCode: HttpStatus.CONFLICT });
      expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('responds with 422 when a symbol is not a variable', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 2 }]));
      query.mockResolvedValueOnce(buildQueryResult([{ row_exists: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([]));
      query.mockResolvedValueOnce(buildQueryResult([{ cnt: 1 }]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await rest(validPayload());

      expect(query).toHaveBeenCalledTimes(9);
      expect(query).toHaveBeenNthCalledWith(9, 'ROLLBACK');
      expect(response.body).toStrictEqual({ error: 'Unprocessable Entity', message: 'Symbol has an invalid type', statusCode: HttpStatus.UNPROCESSABLE_ENTITY });
      expect(response.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('responds with 400 when the system id is not a UUID', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest(validPayload(), { systemId: 'not-a-uuid' });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: 'Validation failed (uuid is expected)', statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 400 when the payload has extra fields', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([guardUser()]));

      const response = await rest({ ...validPayload(), extra: true });

      expect(query).toHaveBeenCalledTimes(1);
      expect(response.body).toStrictEqual({ error: 'Bad Request', message: ['property extra should not exist'], statusCode: HttpStatus.BAD_REQUEST });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    it('responds with 401 when no token is provided', async (): Promise<void> => {
      const response = await request(app.getHttpServer()).post(`/system/${SYSTEM}/statement/${STATEMENT}/distinct-variable-pair`).send(validPayload());

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
