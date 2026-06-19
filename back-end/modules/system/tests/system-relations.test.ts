import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

describe('System Relations', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql system', (): void => {
    it('resolves the systems owner', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          UserEntity_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id owner { id } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" IN ($1)))', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            owner: {
              id: 'f9c7d036-e7e1-4775-b33c-43138e506e82'
            }
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the symbols owned by the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SymbolEntity_id: 'a1b2c3d4-e5f6-4778-9abc-def012345678',
          SymbolEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id symbols { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE (("SymbolEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            symbols: [
              {
                systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
              }
            ]
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves multiple symbols owned by the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SymbolEntity_id: 'a1b2c3d4-e5f6-4778-9abc-def012345678',
          SymbolEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        },
        {
          SymbolEntity_id: 'b2c3d4e5-f6a7-4889-9abc-def012345678',
          SymbolEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id symbols { id } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE (("SymbolEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            symbols: [
              {
                id: 'a1b2c3d4-e5f6-4778-9abc-def012345678'
              },
              {
                id: 'b2c3d4e5-f6a7-4889-9abc-def012345678'
              }
            ]
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the expressions owned by the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          ExpressionEntity_id: 'a1b2c3d4-e5f6-4778-9abc-def012345678',
          ExpressionEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id expressions { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "ExpressionEntity"."id" AS "ExpressionEntity_id", "ExpressionEntity"."system_id" AS "ExpressionEntity_system_id", "ExpressionEntity"."canonical" AS "ExpressionEntity_canonical" FROM "expressions" "ExpressionEntity" WHERE (("ExpressionEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            expressions: [
              {
                systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
              }
            ]
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the expression tokens owned by the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          ExpressionTokenEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id expressionTokens { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "ExpressionTokenEntity"."system_id" AS "ExpressionTokenEntity_system_id", "ExpressionTokenEntity"."symbol_id" AS "ExpressionTokenEntity_symbol_id", "ExpressionTokenEntity"."expression_id" AS "ExpressionTokenEntity_expression_id", "ExpressionTokenEntity"."position" AS "ExpressionTokenEntity_position" FROM "expression_tokens" "ExpressionTokenEntity" WHERE (("ExpressionTokenEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            expressionTokens: [
              {
                systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
              }
            ]
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves multiple expressions owned by the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          ExpressionEntity_id: 'a1b2c3d4-e5f6-4778-9abc-def012345678',
          ExpressionEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        },
        {
          ExpressionEntity_id: 'b2c3d4e5-f6a7-4889-9abc-def012345678',
          ExpressionEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id expressions { id } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "ExpressionEntity"."id" AS "ExpressionEntity_id", "ExpressionEntity"."system_id" AS "ExpressionEntity_system_id", "ExpressionEntity"."canonical" AS "ExpressionEntity_canonical" FROM "expressions" "ExpressionEntity" WHERE (("ExpressionEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            expressions: [
              { id: 'a1b2c3d4-e5f6-4778-9abc-def012345678' },
              { id: 'b2c3d4e5-f6a7-4889-9abc-def012345678' }
            ]
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves multiple expression tokens owned by the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          ExpressionTokenEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          ExpressionTokenEntity_expression_id: 'a1b2c3d4-e5f6-4778-9abc-def012345678',
          ExpressionTokenEntity_position: 0
        },
        {
          ExpressionTokenEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          ExpressionTokenEntity_expression_id: 'a1b2c3d4-e5f6-4778-9abc-def012345678',
          ExpressionTokenEntity_position: 1
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id expressionTokens { position } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "ExpressionTokenEntity"."system_id" AS "ExpressionTokenEntity_system_id", "ExpressionTokenEntity"."symbol_id" AS "ExpressionTokenEntity_symbol_id", "ExpressionTokenEntity"."expression_id" AS "ExpressionTokenEntity_expression_id", "ExpressionTokenEntity"."position" AS "ExpressionTokenEntity_position" FROM "expression_tokens" "ExpressionTokenEntity" WHERE (("ExpressionTokenEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            expressionTokens: [
              { position: 0 },
              { position: 1 }
            ]
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the statements owned by the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          StatementEntity_id: 'a1b2c3d4-e5f6-4778-9abc-def012345678',
          StatementEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id statements { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "StatementEntity"."id" AS "StatementEntity_id", "StatementEntity"."system_id" AS "StatementEntity_system_id", "StatementEntity"."assertion_expression_id" AS "StatementEntity_assertion_expression_id", "StatementEntity"."name" AS "StatementEntity_name", "StatementEntity"."description" AS "StatementEntity_description" FROM "statements" "StatementEntity" WHERE (("StatementEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            statements: [
              {
                systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
              }
            ]
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the hypotheses owned by the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          HypothesisEntity_id: 'a1b2c3d4-e5f6-4778-9abc-def012345678',
          HypothesisEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id hypotheses { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "HypothesisEntity"."id" AS "HypothesisEntity_id", "HypothesisEntity"."system_id" AS "HypothesisEntity_system_id", "HypothesisEntity"."statement_id" AS "HypothesisEntity_statement_id", "HypothesisEntity"."expression_id" AS "HypothesisEntity_expression_id", "HypothesisEntity"."type" AS "HypothesisEntity_type" FROM "statement_hypotheses" "HypothesisEntity" WHERE (("HypothesisEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            hypotheses: [
              {
                systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
              }
            ]
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves the distinct variable pairs owned by the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        {
          DistinctVariablePairEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id distinctVariablePairs { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "DistinctVariablePairEntity"."system_id" AS "DistinctVariablePairEntity_system_id", "DistinctVariablePairEntity"."statement_id" AS "DistinctVariablePairEntity_statement_id", "DistinctVariablePairEntity"."variable_symbol_1_id" AS "DistinctVariablePairEntity_variable_symbol_1_id", "DistinctVariablePairEntity"."variable_symbol_2_id" AS "DistinctVariablePairEntity_variable_symbol_2_id" FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity" WHERE (("DistinctVariablePairEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            distinctVariablePairs: [
              {
                systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
              }
            ]
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves multiple statements owned by the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        { StatementEntity_id: 'a1111111-e5f6-4778-9abc-def012345678', StatementEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7' },
        { StatementEntity_id: 'a2222222-e5f6-4778-9abc-def012345678', StatementEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7' }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id statements { id } } }',
        variables: { systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7' }
      });

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({
        data: { system: { id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7', statements: [{ id: 'a1111111-e5f6-4778-9abc-def012345678' }, { id: 'a2222222-e5f6-4778-9abc-def012345678' }] } }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves multiple hypotheses owned by the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        { HypothesisEntity_id: 'a1111111-e5f6-4778-9abc-def012345678', HypothesisEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7' },
        { HypothesisEntity_id: 'a2222222-e5f6-4778-9abc-def012345678', HypothesisEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7' }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id hypotheses { id } } }',
        variables: { systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7' }
      });

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({
        data: { system: { id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7', hypotheses: [{ id: 'a1111111-e5f6-4778-9abc-def012345678' }, { id: 'a2222222-e5f6-4778-9abc-def012345678' }] } }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves multiple distinct variable pairs owned by the system', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([
        { DistinctVariablePairEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7', DistinctVariablePairEntity_statement_id: 'a1111111-e5f6-4778-9abc-def012345678' },
        { DistinctVariablePairEntity_system_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7', DistinctVariablePairEntity_statement_id: 'a2222222-e5f6-4778-9abc-def012345678' }
      ]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id distinctVariablePairs { statementId } } }',
        variables: { systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7' }
      });

      expect(query).toHaveBeenCalledTimes(2);
      expect(response.body).toStrictEqual({
        data: { system: { id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7', distinctVariablePairs: [{ statementId: 'a1111111-e5f6-4778-9abc-def012345678' }, { statementId: 'a2222222-e5f6-4778-9abc-def012345678' }] } }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when the system owns no symbols', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id symbols { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE (("SymbolEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            symbols: []
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when the system owns no expressions', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id expressions { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "ExpressionEntity"."id" AS "ExpressionEntity_id", "ExpressionEntity"."system_id" AS "ExpressionEntity_system_id", "ExpressionEntity"."canonical" AS "ExpressionEntity_canonical" FROM "expressions" "ExpressionEntity" WHERE (("ExpressionEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            expressions: []
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when the system owns no expression tokens', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id expressionTokens { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "ExpressionTokenEntity"."system_id" AS "ExpressionTokenEntity_system_id", "ExpressionTokenEntity"."symbol_id" AS "ExpressionTokenEntity_symbol_id", "ExpressionTokenEntity"."expression_id" AS "ExpressionTokenEntity_expression_id", "ExpressionTokenEntity"."position" AS "ExpressionTokenEntity_position" FROM "expression_tokens" "ExpressionTokenEntity" WHERE (("ExpressionTokenEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            expressionTokens: []
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when the system owns no statements', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id statements { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "StatementEntity"."id" AS "StatementEntity_id", "StatementEntity"."system_id" AS "StatementEntity_system_id", "StatementEntity"."assertion_expression_id" AS "StatementEntity_assertion_expression_id", "StatementEntity"."name" AS "StatementEntity_name", "StatementEntity"."description" AS "StatementEntity_description" FROM "statements" "StatementEntity" WHERE (("StatementEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            statements: []
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when the system owns no hypotheses', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id hypotheses { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "HypothesisEntity"."id" AS "HypothesisEntity_id", "HypothesisEntity"."system_id" AS "HypothesisEntity_system_id", "HypothesisEntity"."statement_id" AS "HypothesisEntity_statement_id", "HypothesisEntity"."expression_id" AS "HypothesisEntity_expression_id", "HypothesisEntity"."type" AS "HypothesisEntity_type" FROM "statement_hypotheses" "HypothesisEntity" WHERE (("HypothesisEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            hypotheses: []
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('resolves an empty list when the system owns no distinct variable pairs', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id distinctVariablePairs { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "DistinctVariablePairEntity"."system_id" AS "DistinctVariablePairEntity_system_id", "DistinctVariablePairEntity"."statement_id" AS "DistinctVariablePairEntity_statement_id", "DistinctVariablePairEntity"."variable_symbol_1_id" AS "DistinctVariablePairEntity_variable_symbol_1_id", "DistinctVariablePairEntity"."variable_symbol_2_id" AS "DistinctVariablePairEntity_variable_symbol_2_id" FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity" WHERE (("DistinctVariablePairEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: {
          system: {
            id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
            distinctVariablePairs: []
          }
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when the owner is not found', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockResolvedValueOnce(buildQueryResult([]));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id owner { id } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(1, 'SELECT "SystemEntity"."id" AS "SystemEntity_id", "SystemEntity"."owner_user_id" AS "SystemEntity_owner_user_id", "SystemEntity"."name" AS "SystemEntity_name", "SystemEntity"."description" AS "SystemEntity_description" FROM "systems" "SystemEntity" WHERE (("SystemEntity"."id" = $1)) LIMIT 1', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" IN ($1)))', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Not Found',
                message: 'User not found',
                statusCode: HttpStatus.NOT_FOUND
              },
              status: HttpStatus.NOT_FOUND
            },
            locations: [
              {
                column: 63,
                line: 1
              }
            ],
            message: 'User not found',
            path: [
              'system',
              'owner'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the owner fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id owner { id } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "UserEntity"."id" AS "UserEntity_id", "UserEntity"."handle" AS "UserEntity_handle", "UserEntity"."email" AS "UserEntity_email", "UserEntity"."password_hash" AS "UserEntity_password_hash" FROM "users" "UserEntity" WHERE (("UserEntity"."id" IN ($1)))', [
        'f9c7d036-e7e1-4775-b33c-43138e506e82'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Loading users by ID failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 63,
                line: 1
              }
            ],
            message: 'Loading users by ID failed',
            path: [
              'system',
              'owner'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the symbols fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id symbols { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "SymbolEntity"."id" AS "SymbolEntity_id", "SymbolEntity"."system_id" AS "SymbolEntity_system_id", "SymbolEntity"."name" AS "SymbolEntity_name", "SymbolEntity"."description" AS "SymbolEntity_description", "SymbolEntity"."type" AS "SymbolEntity_type", "SymbolEntity"."content" AS "SymbolEntity_content" FROM "symbols" "SymbolEntity" WHERE (("SymbolEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Loading symbols by system ID failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 63,
                line: 1
              }
            ],
            message: 'Loading symbols by system ID failed',
            path: [
              'system',
              'symbols'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the expressions fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id expressions { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "ExpressionEntity"."id" AS "ExpressionEntity_id", "ExpressionEntity"."system_id" AS "ExpressionEntity_system_id", "ExpressionEntity"."canonical" AS "ExpressionEntity_canonical" FROM "expressions" "ExpressionEntity" WHERE (("ExpressionEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Loading expressions by system ID failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 63,
                line: 1
              }
            ],
            message: 'Loading expressions by system ID failed',
            path: [
              'system',
              'expressions'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the expression tokens fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id expressionTokens { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "ExpressionTokenEntity"."system_id" AS "ExpressionTokenEntity_system_id", "ExpressionTokenEntity"."symbol_id" AS "ExpressionTokenEntity_symbol_id", "ExpressionTokenEntity"."expression_id" AS "ExpressionTokenEntity_expression_id", "ExpressionTokenEntity"."position" AS "ExpressionTokenEntity_position" FROM "expression_tokens" "ExpressionTokenEntity" WHERE (("ExpressionTokenEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Loading expression tokens by system ID failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 63,
                line: 1
              }
            ],
            message: 'Loading expression tokens by system ID failed',
            path: [
              'system',
              'expressionTokens'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the statements fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id statements { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "StatementEntity"."id" AS "StatementEntity_id", "StatementEntity"."system_id" AS "StatementEntity_system_id", "StatementEntity"."assertion_expression_id" AS "StatementEntity_assertion_expression_id", "StatementEntity"."name" AS "StatementEntity_name", "StatementEntity"."description" AS "StatementEntity_description" FROM "statements" "StatementEntity" WHERE (("StatementEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Loading statements by system ID failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 63,
                line: 1
              }
            ],
            message: 'Loading statements by system ID failed',
            path: [
              'system',
              'statements'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the hypotheses fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id hypotheses { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "HypothesisEntity"."id" AS "HypothesisEntity_id", "HypothesisEntity"."system_id" AS "HypothesisEntity_system_id", "HypothesisEntity"."statement_id" AS "HypothesisEntity_statement_id", "HypothesisEntity"."expression_id" AS "HypothesisEntity_expression_id", "HypothesisEntity"."type" AS "HypothesisEntity_type" FROM "statement_hypotheses" "HypothesisEntity" WHERE (("HypothesisEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Loading hypotheses by system ID failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 63,
                line: 1
              }
            ],
            message: 'Loading hypotheses by system ID failed',
            path: [
              'system',
              'hypotheses'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when loading the distinct variable pairs fails', async (): Promise<void> => {
      query.mockResolvedValueOnce(buildQueryResult([
        {
          SystemEntity_id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
          SystemEntity_owner_user_id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
          SystemEntity_name: 'TestSystem1',
          SystemEntity_description: 'Test System 1'
        }
      ]));
      query.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query ($systemId: String!) { system(systemId: $systemId) { id distinctVariablePairs { systemId } } }',
        variables: {
          systemId: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
        }
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(2);
      expect(query).toHaveBeenNthCalledWith(2, 'SELECT "DistinctVariablePairEntity"."system_id" AS "DistinctVariablePairEntity_system_id", "DistinctVariablePairEntity"."statement_id" AS "DistinctVariablePairEntity_statement_id", "DistinctVariablePairEntity"."variable_symbol_1_id" AS "DistinctVariablePairEntity_variable_symbol_1_id", "DistinctVariablePairEntity"."variable_symbol_2_id" AS "DistinctVariablePairEntity_variable_symbol_2_id" FROM "statement_distinct_variable_pairs" "DistinctVariablePairEntity" WHERE (("DistinctVariablePairEntity"."system_id" IN ($1)))', [
        'ebe1615e-8c75-461a-b6f4-29db73a14ee7'
      ], true);
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Loading distinct variable pairs by system ID failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 63,
                line: 1
              }
            ],
            message: 'Loading distinct variable pairs by system ID failed',
            path: [
              'system',
              'distinctVariablePairs'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
