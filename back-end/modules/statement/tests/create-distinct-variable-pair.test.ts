import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { countByMock } from '@/common/tests/mocks/count-by.mock';
import { existsByMock } from '@/common/tests/mocks/exists-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { getRepositoryMock } from '@/common/tests/mocks/get-repository.mock';
import { managerMock } from '@/common/tests/mocks/manager.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { transactionMock } from '@/common/tests/mocks/transaction.mock';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
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
  const getRepository = getRepositoryMock();
  const manager = managerMock();
  const save = saveMock();
  const transaction = transactionMock();
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
    const distinctVariablePair = validatePayload({
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    }, DistinctVariablePairEntity);

    countBy.mockResolvedValueOnce(2);
    countBy.mockResolvedValueOnce(2);
    countBy.mockResolvedValueOnce(2);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
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
      id: In([
        variableSymbol1Id,
        variableSymbol2Id
      ]),
      systemId,
      expressionTokens: {
        position: 1,
        expression: {
          hypotheses: {
            statementId,
            type: HypothesisType.type
          }
        }
      }
    });
    expect(existsBy).toHaveBeenCalledTimes(3);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      id: systemId,
      ownerUserId: userId
    });
    expect(existsBy).toHaveBeenNthCalledWith(2, {
      id: statementId,
      systemId
    });
    expect(existsBy).toHaveBeenNthCalledWith(3, {
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    });
    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(3);
    expect(getRepository).toHaveBeenNthCalledWith(1, DistinctVariablePairEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, SymbolEntity);
    expect(getRepository).toHaveBeenNthCalledWith(3, SymbolEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    });
    expect(transaction).toHaveBeenCalledTimes(1);
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
    const distinctVariablePair = validatePayload({
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    }, DistinctVariablePairEntity);

    countBy.mockResolvedValueOnce(2);
    countBy.mockResolvedValueOnce(2);
    countBy.mockResolvedValueOnce(2);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
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
      id: In([
        variableSymbol1Id,
        variableSymbol2Id
      ]),
      systemId,
      expressionTokens: {
        position: 1,
        expression: {
          hypotheses: {
            statementId,
            type: HypothesisType.type
          }
        }
      }
    });
    expect(existsBy).toHaveBeenCalledTimes(3);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      id: systemId,
      ownerUserId: userId
    });
    expect(existsBy).toHaveBeenNthCalledWith(2, {
      id: statementId,
      systemId
    });
    expect(existsBy).toHaveBeenNthCalledWith(3, {
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    });
    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(3);
    expect(getRepository).toHaveBeenNthCalledWith(1, DistinctVariablePairEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, SymbolEntity);
    expect(getRepository).toHaveBeenNthCalledWith(3, SymbolEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    });
    expect(transaction).toHaveBeenCalledTimes(1);
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
