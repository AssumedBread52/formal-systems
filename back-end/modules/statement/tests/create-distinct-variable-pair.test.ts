import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { countByMock } from '@/common/tests/mocks/count-by.mock';
import { existsByMock } from '@/common/tests/mocks/exists-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { In } from 'typeorm';

describe('Create Distinct Variable Pair', (): void => {
  const countBy = countByMock();
  const existsBy = existsByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /system/:systemId/statement/:statementId/distinct-variable-pair', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const variableSymbol1Id = '630e5c73-6231-4128-aae6-1d528f6b4de4';
    const variableSymbol2Id = 'e8172cec-118f-4185-a405-a6cf46869ee0';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const system = validatePayload({
      id: systemId,
      ownerUserId: userId,
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
    const distinctVariablePair = validatePayload({
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    }, DistinctVariablePairEntity);

    countBy.mockResolvedValueOnce(2);
    countBy.mockResolvedValueOnce(2);
    countBy.mockResolvedValueOnce(2);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(statement);
    save.mockResolvedValueOnce(distinctVariablePair);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement/${statementId}/distinct-variable-pair`).set('Cookie', [
      `token=${token}`
    ]).send({
      variableSymbol1Id,
      variableSymbol2Id
    });

    expect(countBy).toHaveBeenCalledTimes(3);
    expect(countBy).toHaveBeenNthCalledWith(1, {
      id: In([
        variableSymbol1Id,
        variableSymbol2Id
      ]),
      systemId
    });
    expect(countBy).toHaveBeenNthCalledWith(2, {
      id: In([
        variableSymbol1Id,
        variableSymbol2Id
      ]),
      systemId,
      type: SymbolType.variable
    });
    expect(countBy).toHaveBeenNthCalledWith(3, {
      systemId,
      statementId,
      type: HypothesisType.type,
      expression: {
        expressionTokens: {
          symbolId: In([
            variableSymbol1Id,
            variableSymbol2Id
          ]),
          position: 1
        }
      }
    });
    expect(existsBy).toHaveBeenCalledTimes(1);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    });
    expect(findOneBy).toHaveBeenCalledTimes(4);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      id: systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    });
    expect(response.body).toStrictEqual(instanceToPlain(distinctVariablePair));
    expect(response.statusCode).toBe(HttpStatus.CREATED);
  });

  it('POST /graphql mutation createDistinctVariablePair', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const variableSymbol1Id = '630e5c73-6231-4128-aae6-1d528f6b4de4';
    const variableSymbol2Id = 'e8172cec-118f-4185-a405-a6cf46869ee0';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const system = validatePayload({
      id: systemId,
      ownerUserId: userId,
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
    const distinctVariablePair = validatePayload({
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    }, DistinctVariablePairEntity);

    countBy.mockResolvedValueOnce(2);
    countBy.mockResolvedValueOnce(2);
    countBy.mockResolvedValueOnce(2);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(statement);
    save.mockResolvedValueOnce(distinctVariablePair);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation ($systemId: String!, $statementId: String!, $distinctVariablePairPayload: NewDistinctVariablePairPayload!) { createDistinctVariablePair(systemId: $systemId, statementId: $statementId, distinctVariablePairPayload: $distinctVariablePairPayload) { systemId statementId variableSymbol1Id variableSymbol2Id } }',
      variables: {
        systemId,
        statementId,
        distinctVariablePairPayload: {
          variableSymbol1Id,
          variableSymbol2Id
        }
      }
    });

    expect(countBy).toHaveBeenCalledTimes(3);
    expect(countBy).toHaveBeenNthCalledWith(1, {
      id: In([
        variableSymbol1Id,
        variableSymbol2Id
      ]),
      systemId
    });
    expect(countBy).toHaveBeenNthCalledWith(2, {
      id: In([
        variableSymbol1Id,
        variableSymbol2Id
      ]),
      systemId,
      type: SymbolType.variable
    });
    expect(countBy).toHaveBeenNthCalledWith(3, {
      systemId,
      statementId,
      type: HypothesisType.type,
      expression: {
        expressionTokens: {
          symbolId: In([
            variableSymbol1Id,
            variableSymbol2Id
          ]),
          position: 1
        }
      }
    });
    expect(existsBy).toHaveBeenCalledTimes(1);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    });
    expect(findOneBy).toHaveBeenCalledTimes(4);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      id: systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    });
    expect(response.body).toStrictEqual({
      data: {
        createDistinctVariablePair: instanceToPlain(distinctVariablePair)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
