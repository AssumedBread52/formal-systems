import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findByMock } from '@/common/tests/mocks/find-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SystemEntity } from '@/system/entities/system.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { In } from 'typeorm';

describe('Distinct Variable Pair Relations', (): void => {
  const findBy = findByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /graphql query distinctVariablePair', async (): Promise<void> => {
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const variableSymbol1Id = '630e5c73-6231-4128-aae6-1d528f6b4de4';
    const variableSymbol2Id = 'e8172cec-118f-4185-a405-a6cf46869ee0';
    const distinctVariablePair = validatePayload({
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    }, DistinctVariablePairEntity);
    const system = validatePayload({
      id: systemId,
      ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
      name: 'TestSystem1',
      description: 'Test System 1'
    }, SystemEntity);
    const statement = validatePayload({
      id: statementId,
      systemId,
      assertionExpressionId: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      name: 'TestStatement1',
      description: 'Test Statement 1'
    }, StatementEntity);
    const variableSymbol1 = validatePayload({
      id: '630e5c73-6231-4128-aae6-1d528f6b4de4',
      systemId,
      name: 'TestSymbol1',
      description: 'Test Symbol 1',
      type: SymbolType.variable,
      content: 'test-content'
    }, SymbolEntity);
    const variableSymbol2 = validatePayload({
      id: 'e8172cec-118f-4185-a405-a6cf46869ee0',
      systemId,
      name: 'TestSymbol2',
      description: 'Test Symbol 2',
      type: SymbolType.variable,
      content: 'test-content'
    }, SymbolEntity);

    findBy.mockResolvedValueOnce([
      statement
    ]);
    findBy.mockResolvedValueOnce([
      variableSymbol1,
      variableSymbol2
    ]);
    findBy.mockResolvedValueOnce([
      system
    ]);
    findOneBy.mockResolvedValueOnce(distinctVariablePair);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!, $statementId: String!, $variableSymbol1Id: String!, $variableSymbol2Id: String!) { distinctVariablePair(systemId: $systemId, statementId: $statementId, variableSymbol1Id: $variableSymbol1Id, variableSymbol2Id: $variableSymbol2Id) { systemId statementId variableSymbol1Id variableSymbol2Id system { id ownerUserId name description } statement { id systemId assertionExpressionId name description } variableSymbol1 { id systemId name description type content } variableSymbol2 { id systemId name description type content } } }',
      variables: {
        systemId,
        statementId,
        variableSymbol1Id,
        variableSymbol2Id
      }
    });

    expect(findBy).toHaveBeenCalledTimes(3);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      id: In([
        statementId
      ])
    });
    expect(findBy).toHaveBeenNthCalledWith(2, {
      id: In([
        variableSymbol1Id,
        variableSymbol2Id
      ])
    });
    expect(findBy).toHaveBeenNthCalledWith(3, {
      id: In([
        systemId
      ])
    });
    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        distinctVariablePair: {
          systemId,
          statementId,
          variableSymbol1Id,
          variableSymbol2Id,
          system: instanceToPlain(system),
          statement: instanceToPlain(statement),
          variableSymbol1: instanceToPlain(variableSymbol1),
          variableSymbol2: instanceToPlain(variableSymbol2)
        }
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
