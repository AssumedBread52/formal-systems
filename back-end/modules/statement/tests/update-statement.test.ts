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
import { StatementEntity } from '@/statement/entities/statement.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';

describe('Update Statement', (): void => {
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

  it('PATCH /system/:systemId/statement/:statementId', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const expressionId = 'cfe59823-eb13-4faf-a90b-c5e82022821f';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const name = 'NewTestStatement1';
    const description = 'New Test Statement 1';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const statement = validatePayload({
      id: statementId,
      systemId,
      assertionExpressionId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
      name: 'TestStatement1',
      description: 'Test Statement 1'
    }, StatementEntity);
    const updatedStatement = validatePayload({
      id: statementId,
      systemId,
      assertionExpressionId: expressionId,
      name,
      description
    }, StatementEntity);

    countBy.mockResolvedValueOnce(1);
    countBy.mockResolvedValueOnce(1);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(false);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(true);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    save.mockResolvedValueOnce(updatedStatement);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      assertionExpressionId: expressionId,
      name,
      description
    });

    expect(countBy).toHaveBeenCalledTimes(2);
    expect(countBy).toHaveBeenNthCalledWith(1, {
      expressionId,
      symbol: {
        type: SymbolType.variable
      }
    });
    expect(countBy).toHaveBeenNthCalledWith(2, {
      expressionId,
      symbol: {
        type: SymbolType.variable,
        expressionTokens: {
          position: 1,
          expression: {
            hypotheses: {
              statementId,
              type: HypothesisType.type
            }
          }
        }
      }
    });
    expect(existsBy).toHaveBeenCalledTimes(4);
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
      expressionId,
      position: 0,
      symbol: {
        type: SymbolType.constant
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(3);
    expect(getRepository).toHaveBeenNthCalledWith(1, StatementEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, ExpressionTokenEntity);
    expect(getRepository).toHaveBeenNthCalledWith(3, ExpressionTokenEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, updatedStatement);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual(instanceToPlain(updatedStatement));
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('PATCH /system/:systemId/statement/:statementId', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const expressionId = 'cfe59823-eb13-4faf-a90b-c5e82022821f';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const name = 'NewTestStatement1';
    const description = 'New Test Statement 1';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const statement = validatePayload({
      id: statementId,
      systemId,
      assertionExpressionId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
      name: 'TestStatement1',
      description: 'Test Statement 1'
    }, StatementEntity);
    const updatedStatement = validatePayload({
      id: statementId,
      systemId,
      assertionExpressionId: expressionId,
      name,
      description
    }, StatementEntity);

    countBy.mockResolvedValueOnce(1);
    countBy.mockResolvedValueOnce(1);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(false);
    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(true);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    save.mockResolvedValueOnce(updatedStatement);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation ($systemId: String!, $statementId: String!, $statementPayload: EditStatementPayload!) { updateStatement(systemId: $systemId, statementId: $statementId, statementPayload: $statementPayload) { id systemId assertionExpressionId name description } }',
      variables: {
        systemId,
        statementId,
        statementPayload: {
          assertionExpressionId: expressionId,
          name,
          description
        }
      }
    });

    expect(countBy).toHaveBeenCalledTimes(2);
    expect(countBy).toHaveBeenNthCalledWith(1, {
      expressionId,
      symbol: {
        type: SymbolType.variable
      }
    });
    expect(countBy).toHaveBeenNthCalledWith(2, {
      expressionId,
      symbol: {
        type: SymbolType.variable,
        expressionTokens: {
          position: 1,
          expression: {
            hypotheses: {
              statementId,
              type: HypothesisType.type
            }
          }
        }
      }
    });
    expect(existsBy).toHaveBeenCalledTimes(4);
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
      expressionId,
      position: 0,
      symbol: {
        type: SymbolType.constant
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(3);
    expect(getRepository).toHaveBeenNthCalledWith(1, StatementEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, ExpressionTokenEntity);
    expect(getRepository).toHaveBeenNthCalledWith(3, ExpressionTokenEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, updatedStatement);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual({
      data: {
        updateStatement: instanceToPlain(updatedStatement)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
