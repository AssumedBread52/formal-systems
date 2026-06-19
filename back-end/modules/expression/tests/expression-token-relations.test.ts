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
const TOKENS_LOADER = 'SELECT "ExpressionTokenEntity"."system_id" AS "ExpressionTokenEntity_system_id", "ExpressionTokenEntity"."symbol_id" AS "ExpressionTokenEntity_symbol_id", "ExpressionTokenEntity"."expression_id" AS "ExpressionTokenEntity_expression_id", "ExpressionTokenEntity"."position" AS "ExpressionTokenEntity_position" FROM "expression_tokens" "ExpressionTokenEntity" WHERE (("ExpressionTokenEntity"."expression_id" IN ($1)))';
const EXPRESSION_LOADER = 'SELECT "ExpressionEntity"."id" AS "ExpressionEntity_id", "ExpressionEntity"."system_id" AS "ExpressionEntity_system_id", "ExpressionEntity"."canonical" AS "ExpressionEntity_canonical" FROM "expressions" "ExpressionEntity" WHERE (("ExpressionEntity"."id" IN ($1)))';
const SYMBOL_LOADER = 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE (("SymbolEntity"."id" IN ($1)))';
const SYSTEM_LOADER = 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" IN ($1)))';

describe('Expression Token Relations', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  const expressionRow = (): Record<string, unknown> => {
    return { ExpressionEntity_id: EXPRESSION, ExpressionEntity_system_id: SYSTEM, ExpressionEntity_canonical: [SYMBOL] };
  };

  const tokenRow = (): Record<string, unknown> => {
    return { ExpressionTokenEntity_system_id: SYSTEM, ExpressionTokenEntity_symbol_id: SYMBOL, ExpressionTokenEntity_expression_id: EXPRESSION, ExpressionTokenEntity_position: 0 };
  };

  const send = (field: string, sub: string): request.Test => {
    return request(app.getHttpServer()).post('/graphql').send({
      query: `query ($systemId: String!, $expressionId: String!) { expression(systemId: $systemId, expressionId: $expressionId) { id expressionTokens { position ${field} { ${sub} } } } }`,
      variables: { systemId: SYSTEM, expressionId: EXPRESSION }
    });
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql expression expressionTokens', (): void => {
    it('resolves the expression the token belongs to', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));

      const response = await send('expression', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(1, SELECT_BY_ID, [EXPRESSION, SYSTEM], true);
      expect(query).toHaveBeenNthCalledWith(2, TOKENS_LOADER, [EXPRESSION], true);
      expect(query).toHaveBeenNthCalledWith(3, EXPRESSION_LOADER, [EXPRESSION], true);
      expect(response.body).toStrictEqual({ data: { expression: { id: EXPRESSION, expressionTokens: [{ position: 0, expression: { id: EXPRESSION } }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the expression is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('expression', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, EXPRESSION_LOADER, [EXPRESSION], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Expression not found');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the expression fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('expression', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Loading expressions by ID failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the symbol the token references', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ SymbolEntity_id: SYMBOL, SymbolEntity_system_id: SYSTEM, SymbolEntity_name: 'S', SymbolEntity_description: 'D', SymbolEntity_type: 'constant', SymbolEntity_content: 'A' }]));

      const response = await send('symbol', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, SYMBOL_LOADER, [SYMBOL], true);
      expect(response.body).toStrictEqual({ data: { expression: { id: EXPRESSION, expressionTokens: [{ position: 0, symbol: { id: SYMBOL } }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the symbol is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('symbol', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, SYMBOL_LOADER, [SYMBOL], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Symbol not found');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the symbol fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('symbol', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Loading symbols by ID failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the system the token belongs to', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([{ SystemEntity_id: SYSTEM, SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82', SystemEntity_name: 'S', SystemEntity_description: 'D' }]));

      const response = await send('system', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, SYSTEM_LOADER, [SYSTEM], true);
      expect(response.body).toStrictEqual({ data: { expression: { id: EXPRESSION, expressionTokens: [{ position: 0, system: { id: SYSTEM } }] } } });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the system is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await send('system', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(query).toHaveBeenNthCalledWith(3, SYSTEM_LOADER, [SYSTEM], true);
      expect(response.body.errors[0].extensions.originalError.message).toBe('System not found');
      expect(response.body.errors[0].extensions.originalError.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the system fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([expressionRow()]));
      query.mockResolvedValueOnce(buildQueryResult([tokenRow()]));
      query.mockRejectedValueOnce(new Error());

      const response = await send('system', 'id');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(3);
      expect(response.body.errors[0].extensions.originalError.message).toBe('Loading systems by ID failed');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
