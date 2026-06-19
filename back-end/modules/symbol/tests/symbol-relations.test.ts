import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

const SYSTEM = 'ebe1615e-8c75-461a-b6f4-29db73a14ee7';
const SYMBOL = 'a1b2c3d4-e5f6-4778-9abc-def012345678';
const SELECT_BY_ID = 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE (("SymbolEntity"."id" = $1) AND ("SymbolEntity"."system_id" = $2)) LIMIT 1';
const DV1_LOADER = 'SELECT "DistinctVariablePairEntity"."system_id" AS "DistinctVariablePairEntity_system_id", "DistinctVariablePairEntity"."statement_id" AS "DistinctVariablePairEntity_statement_id", "DistinctVariablePairEntity"."variable_symbol_1_id" AS "DistinctVariablePairEntity_variable_symbol_1_id", "DistinctVariablePairEntity"."variable_symbol_2_id" AS "DistinctVariablePairEntity_variable_symbol_2_id" FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity" WHERE (("DistinctVariablePairEntity"."variable_symbol_1_id" IN ($1)))';
const DV2_LOADER = 'SELECT "DistinctVariablePairEntity"."system_id" AS "DistinctVariablePairEntity_system_id", "DistinctVariablePairEntity"."statement_id" AS "DistinctVariablePairEntity_statement_id", "DistinctVariablePairEntity"."variable_symbol_1_id" AS "DistinctVariablePairEntity_variable_symbol_1_id", "DistinctVariablePairEntity"."variable_symbol_2_id" AS "DistinctVariablePairEntity_variable_symbol_2_id" FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity" WHERE (("DistinctVariablePairEntity"."variable_symbol_2_id" IN ($1)))';
const EXPRESSION_TOKENS_LOADER = 'SELECT "ExpressionTokenEntity"."system_id" AS "ExpressionTokenEntity_system_id", "ExpressionTokenEntity"."symbol_id" AS "ExpressionTokenEntity_symbol_id", "ExpressionTokenEntity"."expression_id" AS "ExpressionTokenEntity_expression_id", "ExpressionTokenEntity"."position" AS "ExpressionTokenEntity_position" FROM "expression_tokens" "ExpressionTokenEntity" WHERE (("ExpressionTokenEntity"."symbol_id" IN ($1)))';
const SYSTEM_LOADER = 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" IN ($1)))';

describe('Symbol Relations', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const symbolRow = (): Record<string, unknown> => {
    return {
      SymbolEntity_id: SYMBOL,
      SymbolEntity_system_id: SYSTEM,
      SymbolEntity_name: 'TestSymbol1',
      SymbolEntity_description: 'Test Symbol 1',
      SymbolEntity_type: 'constant',
      SymbolEntity_content: 'A'
    };
  };

  const send = (field: string, sub: string): request.Test => {
    return request(app.getHttpServer()).post('/graphql').send({
      query: `query ($systemId: String!, $symbolId: String!) { symbol(systemId: $systemId, symbolId: $symbolId) { id ${field} { ${sub} } } }`,
      variables: { systemId: SYSTEM, symbolId: SYMBOL }
    });
  };

  const error = (field: string, message: string, statusCode: number, errorLabel: string): Record<string, unknown> => {
    return {
      data: null,
      errors: [
        {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            originalError: {
              error: errorLabel,
              message,
              statusCode
            },
            status: statusCode
          },
          locations: [{ column: 104, line: 1 }],
          message,
          path: ['symbol', field]
        }
      ]
    };
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql symbol', (): void => {
    it('resolves the distinct variable pairs the symbol is the first variable of', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ DistinctVariablePairEntity_system_id: SYSTEM, DistinctVariablePairEntity_variable_symbol_1_id: SYMBOL }]));

      const response = await send('distinctVariable1Pairs', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [SYMBOL, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(2, DV1_LOADER, [SYMBOL], true);
      expect(response.body).toStrictEqual({ data: { symbol: { id: SYMBOL, distinctVariable1Pairs: [{ systemId: SYSTEM }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves multiple distinct variable pairs the symbol is the first variable of', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([
        { DistinctVariablePairEntity_variable_symbol_1_id: SYMBOL, DistinctVariablePairEntity_statement_id: '11111111-e5f6-4778-9abc-def012345678' },
        { DistinctVariablePairEntity_variable_symbol_1_id: SYMBOL, DistinctVariablePairEntity_statement_id: '22222222-e5f6-4778-9abc-def012345678' }
      ]));

      const response = await send('distinctVariable1Pairs', 'statementId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, DV1_LOADER, [SYMBOL], true);
      expect(response.body).toStrictEqual({ data: { symbol: { id: SYMBOL, distinctVariable1Pairs: [{ statementId: '11111111-e5f6-4778-9abc-def012345678' }, { statementId: '22222222-e5f6-4778-9abc-def012345678' }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when the symbol is the first variable of no distinct variable pairs', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('distinctVariable1Pairs', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, DV1_LOADER, [SYMBOL], true);
      expect(response.body).toStrictEqual({ data: { symbol: { id: SYMBOL, distinctVariable1Pairs: [] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the first variable distinct variable pairs fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('distinctVariable1Pairs', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual(error('distinctVariable1Pairs', 'Loading distinct variable pairs by symbol 1 ID failed', HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the distinct variable pairs the symbol is the second variable of', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ DistinctVariablePairEntity_system_id: SYSTEM, DistinctVariablePairEntity_variable_symbol_2_id: SYMBOL }]));

      const response = await send('distinctVariable2Pairs', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, DV2_LOADER, [SYMBOL], true);
      expect(response.body).toStrictEqual({ data: { symbol: { id: SYMBOL, distinctVariable2Pairs: [{ systemId: SYSTEM }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves multiple distinct variable pairs the symbol is the second variable of', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([
        { DistinctVariablePairEntity_variable_symbol_2_id: SYMBOL, DistinctVariablePairEntity_statement_id: '11111111-e5f6-4778-9abc-def012345678' },
        { DistinctVariablePairEntity_variable_symbol_2_id: SYMBOL, DistinctVariablePairEntity_statement_id: '22222222-e5f6-4778-9abc-def012345678' }
      ]));

      const response = await send('distinctVariable2Pairs', 'statementId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, DV2_LOADER, [SYMBOL], true);
      expect(response.body).toStrictEqual({ data: { symbol: { id: SYMBOL, distinctVariable2Pairs: [{ statementId: '11111111-e5f6-4778-9abc-def012345678' }, { statementId: '22222222-e5f6-4778-9abc-def012345678' }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when the symbol is the second variable of no distinct variable pairs', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('distinctVariable2Pairs', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, DV2_LOADER, [SYMBOL], true);
      expect(response.body).toStrictEqual({ data: { symbol: { id: SYMBOL, distinctVariable2Pairs: [] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the second variable distinct variable pairs fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('distinctVariable2Pairs', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual(error('distinctVariable2Pairs', 'Loading distinct variable pairs by symbol 2 ID failed', HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the expression tokens that reference the symbol', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ ExpressionTokenEntity_system_id: SYSTEM, ExpressionTokenEntity_symbol_id: SYMBOL }]));

      const response = await send('expressionTokens', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, EXPRESSION_TOKENS_LOADER, [SYMBOL], true);
      expect(response.body).toStrictEqual({ data: { symbol: { id: SYMBOL, expressionTokens: [{ systemId: SYSTEM }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves multiple expression tokens that reference the symbol', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([
        { ExpressionTokenEntity_system_id: SYSTEM, ExpressionTokenEntity_symbol_id: SYMBOL, ExpressionTokenEntity_position: 0 },
        { ExpressionTokenEntity_system_id: SYSTEM, ExpressionTokenEntity_symbol_id: SYMBOL, ExpressionTokenEntity_position: 1 }
      ]));

      const response = await send('expressionTokens', 'position');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, EXPRESSION_TOKENS_LOADER, [SYMBOL], true);
      expect(response.body).toStrictEqual({ data: { symbol: { id: SYMBOL, expressionTokens: [{ position: 0 }, { position: 1 }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when no expression tokens reference the symbol', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('expressionTokens', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, EXPRESSION_TOKENS_LOADER, [SYMBOL], true);
      expect(response.body).toStrictEqual({ data: { symbol: { id: SYMBOL, expressionTokens: [] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the expression tokens fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('expressionTokens', 'systemId');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual(error('expressionTokens', 'Loading expression tokens by symbol ID failed', HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the system the symbol belongs to', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ SystemEntity_id: SYSTEM, SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82', SystemEntity_name: 'S', SystemEntity_description: 'D' }]));

      const response = await send('system', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, SYSTEM_LOADER, [SYSTEM], true);
      expect(response.body).toStrictEqual({ data: { symbol: { id: SYMBOL, system: { id: SYSTEM } } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the system is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('system', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, SYSTEM_LOADER, [SYSTEM], true);
      expect(response.body).toStrictEqual(error('system', 'System not found', HttpStatus.NOT_FOUND, 'Not Found'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the system fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([symbolRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('system', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual(error('system', 'Loading systems by ID failed', HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'));
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
