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
import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
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
import { In, MoreThan } from 'typeorm';

describe('Create Statement', (): void => {
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

  it('POST /system/:systemId/statement', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const expressionId = 'cfe59823-eb13-4faf-a90b-c5e82022821f';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const name = 'TestStatement1';
    const description = 'Test Statement 1';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const statement = validatePayload({
      id: '9df17e91-7e96-40b6-a455-c57148d7c92b',
      systemId,
      assertionExpressionId: expressionId,
      name,
      description
    }, StatementEntity);

    countBy.mockResolvedValueOnce(1);
    countBy.mockResolvedValueOnce(1);
    countBy.mockResolvedValueOnce(1);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(false);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    save.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      assertionExpressionId: expressionId,
      typeHypothesesExpressionIds: [
        expressionId
      ],
      name,
      description
    });

    expect(countBy).toHaveBeenCalledTimes(3);
    expect(countBy).toHaveBeenNthCalledWith(1, {
      expressionTokens: {
        expressionId: In([
          expressionId
        ]),
        position: 1
      }
    });
    expect(countBy).toHaveBeenNthCalledWith(2, {
      expressionId,
      symbol: {
        type: SymbolType.variable
      }
    });
    expect(countBy).toHaveBeenNthCalledWith(3, {
      expressionId,
      symbol: {
        type: SymbolType.variable,
        expressionTokens: {
          expressionId: In([
            expressionId
          ]),
          position: 1
        }
      }
    });
    expect(existsBy).toHaveBeenCalledTimes(8);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      id: systemId,
      ownerUserId: userId
    });
    expect(existsBy).toHaveBeenNthCalledWith(2, {
      systemId,
      name
    });
    expect(existsBy).toHaveBeenNthCalledWith(3, {
      id: expressionId,
      systemId
    });
    expect(existsBy).toHaveBeenNthCalledWith(4, {
      id: expressionId,
      systemId
    });
    expect(existsBy).toHaveBeenNthCalledWith(5, {
      expressionId,
      position: 0,
      symbol: {
        type: SymbolType.constant
      }
    });
    expect(existsBy).toHaveBeenNthCalledWith(6, {
      expressionId,
      position: 0,
      symbol: {
        type: SymbolType.constant
      }
    });
    expect(existsBy).toHaveBeenNthCalledWith(7, {
      expressionId,
      position: 1,
      symbol: {
        type: SymbolType.variable
      }
    });
    expect(existsBy).toHaveBeenNthCalledWith(8, {
      expressionId,
      position: MoreThan(1)
    });
    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(6);
    expect(getRepository).toHaveBeenNthCalledWith(1, HypothesisEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, StatementEntity);
    expect(getRepository).toHaveBeenNthCalledWith(3, ExpressionTokenEntity);
    expect(getRepository).toHaveBeenNthCalledWith(4, ExpressionTokenEntity);
    expect(getRepository).toHaveBeenNthCalledWith(5, SymbolEntity);
    expect(getRepository).toHaveBeenNthCalledWith(6, ExpressionTokenEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenNthCalledWith(1, {
      systemId,
      assertionExpressionId: expressionId,
      name,
      description
    });
    expect(save).toHaveBeenNthCalledWith(2, [
      {
        systemId,
        statementId,
        expressionId,
        type: HypothesisType.type
      }
    ]);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual(instanceToPlain(statement));
    expect(response.statusCode).toBe(HttpStatus.CREATED);
  });

  it('POST /graphql mutation createStatement', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const expressionId = 'cfe59823-eb13-4faf-a90b-c5e82022821f';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const name = 'TestStatement1';
    const description = 'Test Statement 1';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const statement = validatePayload({
      id: '9df17e91-7e96-40b6-a455-c57148d7c92b',
      systemId,
      assertionExpressionId: expressionId,
      name,
      description
    }, StatementEntity);

    countBy.mockResolvedValueOnce(1);
    countBy.mockResolvedValueOnce(1);
    countBy.mockResolvedValueOnce(1);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(false);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    save.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation ($systemId: String!, $statementPayload: NewStatementPayload!) { createStatement(systemId: $systemId, statementPayload: $statementPayload) { id systemId assertionExpressionId name description } }',
      variables: {
        systemId,
        statementPayload: {
          assertionExpressionId: expressionId,
          typeHypothesesExpressionIds: [
            expressionId
          ],
          name,
          description
        }
      }
    });

    expect(countBy).toHaveBeenCalledTimes(3);
    expect(countBy).toHaveBeenNthCalledWith(1, {
      expressionTokens: {
        expressionId: In([
          expressionId
        ]),
        position: 1
      }
    });
    expect(countBy).toHaveBeenNthCalledWith(2, {
      expressionId,
      symbol: {
        type: SymbolType.variable
      }
    });
    expect(countBy).toHaveBeenNthCalledWith(3, {
      expressionId,
      symbol: {
        type: SymbolType.variable,
        expressionTokens: {
          expressionId: In([
            expressionId
          ]),
          position: 1
        }
      }
    });
    expect(existsBy).toHaveBeenCalledTimes(8);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      id: systemId,
      ownerUserId: userId
    });
    expect(existsBy).toHaveBeenNthCalledWith(2, {
      systemId,
      name
    });
    expect(existsBy).toHaveBeenNthCalledWith(3, {
      id: expressionId,
      systemId
    });
    expect(existsBy).toHaveBeenNthCalledWith(4, {
      id: expressionId,
      systemId
    });
    expect(existsBy).toHaveBeenNthCalledWith(5, {
      expressionId,
      position: 0,
      symbol: {
        type: SymbolType.constant
      }
    });
    expect(existsBy).toHaveBeenNthCalledWith(6, {
      expressionId,
      position: 0,
      symbol: {
        type: SymbolType.constant
      }
    });
    expect(existsBy).toHaveBeenNthCalledWith(7, {
      expressionId,
      position: 1,
      symbol: {
        type: SymbolType.variable
      }
    });
    expect(existsBy).toHaveBeenNthCalledWith(8, {
      expressionId,
      position: MoreThan(1)
    });
    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(6);
    expect(getRepository).toHaveBeenNthCalledWith(1, HypothesisEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, StatementEntity);
    expect(getRepository).toHaveBeenNthCalledWith(3, ExpressionTokenEntity);
    expect(getRepository).toHaveBeenNthCalledWith(4, ExpressionTokenEntity);
    expect(getRepository).toHaveBeenNthCalledWith(5, SymbolEntity);
    expect(getRepository).toHaveBeenNthCalledWith(6, ExpressionTokenEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenNthCalledWith(1, {
      systemId,
      assertionExpressionId: expressionId,
      name,
      description
    });
    expect(save).toHaveBeenNthCalledWith(2, [
      {
        systemId,
        statementId,
        expressionId,
        type: HypothesisType.type
      }
    ]);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual({
      data: {
        createStatement: instanceToPlain(statement)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
