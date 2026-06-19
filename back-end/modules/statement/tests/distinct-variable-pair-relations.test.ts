import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

const SYSTEM = 'ebe1615e-8c75-461a-b6f4-29db73a14ee7';
const STATEMENT = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const VAR1 = '11111111-e5f6-4778-9abc-def012345678';
const VAR2 = '22222222-e5f6-4778-9abc-def012345678';
const SELECT_BY_ID = 'SELECT "DistinctVariablePairEntity"."system_id" AS "DistinctVariablePairEntity_system_id", "DistinctVariablePairEntity"."statement_id" AS "DistinctVariablePairEntity_statement_id", "DistinctVariablePairEntity"."variable_symbol_1_id" AS "DistinctVariablePairEntity_variable_symbol_1_id", "DistinctVariablePairEntity"."variable_symbol_2_id" AS "DistinctVariablePairEntity_variable_symbol_2_id" FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity" WHERE (("DistinctVariablePairEntity"."system_id" = $1) AND ("DistinctVariablePairEntity"."statement_id" = $2) AND ("DistinctVariablePairEntity"."variable_symbol_1_id" = $3) AND ("DistinctVariablePairEntity"."variable_symbol_2_id" = $4)) LIMIT 1';
const STATEMENT_LOADER = 'SELECT "StatementEntity"."id" AS "StatementEntity_id", "StatementEntity"."system_id" AS "StatementEntity_system_id", "StatementEntity"."assertion_expression_id" AS "StatementEntity_assertion_expression_id", "StatementEntity"."name" AS "StatementEntity_name", "StatementEntity"."description" AS "StatementEntity_description" FROM "statements" "StatementEntity" WHERE (("StatementEntity"."id" IN ($1)))';
const SYMBOL_LOADER = 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE (("SymbolEntity"."id" IN ($1)))';
const SYSTEM_LOADER = 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" IN ($1)))';

describe('Distinct Variable Pair Relations', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const pairRow = (): Record<string, unknown> => {
    return {
      DistinctVariablePairEntity_system_id: SYSTEM,
      DistinctVariablePairEntity_statement_id: STATEMENT,
      DistinctVariablePairEntity_variable_symbol_1_id: VAR1,
      DistinctVariablePairEntity_variable_symbol_2_id: VAR2
    };
  };

  const symbolResult = (id: string): Record<string, unknown> => {
    return { SymbolEntity_id: id, SymbolEntity_system_id: SYSTEM, SymbolEntity_name: 'S', SymbolEntity_description: 'D', SymbolEntity_type: 'variable', SymbolEntity_content: 'x' };
  };

  const send = (field: string, sub: string): request.Test => {
    return request(app.getHttpServer()).post('/graphql').send({
      query: `query ($systemId: String!, $statementId: String!, $variableSymbol1Id: String!, $variableSymbol2Id: String!) { distinctVariablePair(systemId: $systemId, statementId: $statementId, variableSymbol1Id: $variableSymbol1Id, variableSymbol2Id: $variableSymbol2Id) { systemId ${field} { ${sub} } } }`,
      variables: { systemId: SYSTEM, statementId: STATEMENT, variableSymbol1Id: VAR1, variableSymbol2Id: VAR2 }
    });
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql distinctVariablePair', (): void => {
    it('resolves the statement the pair belongs to', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ StatementEntity_id: STATEMENT, StatementEntity_system_id: SYSTEM, StatementEntity_assertion_expression_id: VAR1, StatementEntity_name: 'N', StatementEntity_description: 'D' }]));

      const response = await send('statement', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [SYSTEM, STATEMENT, VAR1, VAR2], true);
      expect(query).toHaveBeenNthCalledWith(2, STATEMENT_LOADER, [STATEMENT], true);
      expect(response.body).toStrictEqual({ data: { distinctVariablePair: { systemId: SYSTEM, statement: { id: STATEMENT } } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the statement is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('statement', 'id');

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Statement not found');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the first variable symbol', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolResult(VAR1)]));

      const response = await send('variableSymbol1', 'id');

      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, SYMBOL_LOADER, [VAR1], true);
      expect(response.body).toStrictEqual({ data: { distinctVariablePair: { systemId: SYSTEM, variableSymbol1: { id: VAR1 } } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the second variable symbol', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
      query.mockResolvedValueOnce(buildQueryResult([symbolResult(VAR2)]));

      const response = await send('variableSymbol2', 'id');

      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, SYMBOL_LOADER, [VAR2], true);
      expect(response.body).toStrictEqual({ data: { distinctVariablePair: { systemId: SYSTEM, variableSymbol2: { id: VAR2 } } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when a variable symbol is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('variableSymbol1', 'id');

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Symbol not found');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the system the pair belongs to', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ SystemEntity_id: SYSTEM, SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82', SystemEntity_name: 'S', SystemEntity_description: 'D' }]));

      const response = await send('system', 'id');

      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, SYSTEM_LOADER, [SYSTEM], true);
      expect(response.body).toStrictEqual({ data: { distinctVariablePair: { systemId: SYSTEM, system: { id: SYSTEM } } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the system fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([pairRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('system', 'id');

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Loading systems by ID failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
