import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { countByMock } from '@/common/tests/mocks/count-by.mock';
import { existsByMock } from '@/common/tests/mocks/exists-by.mock';
import { findByMock } from '@/common/tests/mocks/find-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { getRepositoryMock } from '@/common/tests/mocks/get-repository.mock';
import { managerMock } from '@/common/tests/mocks/manager.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { transactionMock } from '@/common/tests/mocks/transaction.mock';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
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

describe('Create Statement', (): void => {
  const countBy = countByMock();
  const existsBy = existsByMock();
  const findBy = findByMock();
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
    const system = validatePayload({
      id: systemId,
      ownerUserId: userId,
      name: 'TestSystem1',
      description: 'Test System 1'
    }, SystemEntity);
    const variableSymbol = validatePayload({
      id: '630e5c73-6231-4128-aae6-1d528f6b4de4',
      systemId,
      name: 'TestSymbol1',
      description: 'Test Symbol 1',
      type: SymbolType.variable,
      content: 'test-content'
    }, SymbolEntity);
    const assertion = validatePayload({
      id: expressionId,
      systemId,
      canonical: [
        '7bde3313-f751-42f0-8d89-88c4ab394282',
        '630e5c73-6231-4128-aae6-1d528f6b4de4'
      ]
    }, ExpressionEntity);
    const hypothesis = validatePayload({
      id: '72b9158b-bba0-46c7-b898-5e80a64d1ed4',
      systemId,
      statementId,
      expressionId,
      type: HypothesisType.type
    }, HypothesisEntity);
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
    countBy.mockResolvedValueOnce(1);
    countBy.mockResolvedValueOnce(1);
    countBy.mockResolvedValueOnce(1);
    existsBy.mockResolvedValueOnce(false);
    findBy.mockResolvedValueOnce([
      assertion
    ]);
    findBy.mockResolvedValueOnce([
      variableSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(assertion);
    save.mockResolvedValueOnce(statement);
    save.mockResolvedValueOnce([
      hypothesis
    ]);

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

    expect(countBy).toHaveBeenCalledTimes(6);
    expect(countBy).toHaveBeenNthCalledWith(1, {
      id: In([
        '7bde3313-f751-42f0-8d89-88c4ab394282'
      ]),
      systemId
    });
    expect(countBy).toHaveBeenNthCalledWith(2, {
      id: In([
        '7bde3313-f751-42f0-8d89-88c4ab394282'
      ]),
      systemId,
      type: SymbolType.constant
    });
    expect(countBy).toHaveBeenNthCalledWith(3, {
      id: In([
        '7bde3313-f751-42f0-8d89-88c4ab394282'
      ]),
      systemId
    });
    expect(countBy).toHaveBeenNthCalledWith(4, {
      id: In([
        '7bde3313-f751-42f0-8d89-88c4ab394282'
      ]),
      systemId,
      type: SymbolType.constant
    });
    expect(countBy).toHaveBeenNthCalledWith(5, {
      id: In([
        '630e5c73-6231-4128-aae6-1d528f6b4de4'
      ]),
      systemId
    });
    expect(countBy).toHaveBeenNthCalledWith(6, {
      id: In([
        '630e5c73-6231-4128-aae6-1d528f6b4de4'
      ]),
      systemId,
      type: SymbolType.variable
    });
    expect(existsBy).toHaveBeenCalledTimes(1);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      systemId,
      name
    });
    expect(findBy).toHaveBeenCalledTimes(2);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      id: In([
        expressionId
      ]),
      systemId,
      canonical: expect.objectContaining({
        _multipleParameters: true,
        _objectLiteralParameters: undefined,
        _type: "raw",
        _useParameter: true,
        _value: []
      })
    });
    expect(findBy).toHaveBeenNthCalledWith(2, {
      type: SymbolType.variable,
      expressionTokens: {
        expressionId,
        systemId
      }
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
      id: expressionId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(6);
    expect(getRepository).toHaveBeenNthCalledWith(1, ExpressionEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, HypothesisEntity);
    expect(getRepository).toHaveBeenNthCalledWith(3, StatementEntity);
    expect(getRepository).toHaveBeenNthCalledWith(4, SymbolEntity);
    expect(getRepository).toHaveBeenNthCalledWith(5, SymbolEntity);
    expect(getRepository).toHaveBeenNthCalledWith(6, SymbolEntity);
    expect(getRepository).toHaveBeenNthCalledWith
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
    const system = validatePayload({
      id: systemId,
      ownerUserId: userId,
      name: 'TestSystem1',
      description: 'Test System 1'
    }, SystemEntity);
    const variableSymbol = validatePayload({
      id: '630e5c73-6231-4128-aae6-1d528f6b4de4',
      systemId,
      name: 'TestSymbol1',
      description: 'Test Symbol 1',
      type: SymbolType.variable,
      content: 'test-content'
    }, SymbolEntity);
    const assertion = validatePayload({
      id: expressionId,
      systemId,
      canonical: [
        '7bde3313-f751-42f0-8d89-88c4ab394282',
        '630e5c73-6231-4128-aae6-1d528f6b4de4'
      ]
    }, ExpressionEntity);
    const hypothesis = validatePayload({
      id: '72b9158b-bba0-46c7-b898-5e80a64d1ed4',
      systemId,
      statementId,
      expressionId,
      type: HypothesisType.type
    }, HypothesisEntity);
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
    countBy.mockResolvedValueOnce(1);
    countBy.mockResolvedValueOnce(1);
    countBy.mockResolvedValueOnce(1);
    existsBy.mockResolvedValueOnce(false);
    findBy.mockResolvedValueOnce([
      assertion
    ]);
    findBy.mockResolvedValueOnce([
      variableSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(assertion);
    save.mockResolvedValueOnce(statement);
    save.mockResolvedValueOnce([
      hypothesis
    ]);

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

    expect(countBy).toHaveBeenCalledTimes(6);
    expect(countBy).toHaveBeenNthCalledWith(1, {
      id: In([
        '7bde3313-f751-42f0-8d89-88c4ab394282'
      ]),
      systemId
    });
    expect(countBy).toHaveBeenNthCalledWith(2, {
      id: In([
        '7bde3313-f751-42f0-8d89-88c4ab394282'
      ]),
      systemId,
      type: SymbolType.constant
    });
    expect(countBy).toHaveBeenNthCalledWith(3, {
      id: In([
        '7bde3313-f751-42f0-8d89-88c4ab394282'
      ]),
      systemId
    });
    expect(countBy).toHaveBeenNthCalledWith(4, {
      id: In([
        '7bde3313-f751-42f0-8d89-88c4ab394282'
      ]),
      systemId,
      type: SymbolType.constant
    });
    expect(countBy).toHaveBeenNthCalledWith(5, {
      id: In([
        '630e5c73-6231-4128-aae6-1d528f6b4de4'
      ]),
      systemId
    });
    expect(countBy).toHaveBeenNthCalledWith(6, {
      id: In([
        '630e5c73-6231-4128-aae6-1d528f6b4de4'
      ]),
      systemId,
      type: SymbolType.variable
    });
    expect(existsBy).toHaveBeenCalledTimes(1);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      systemId,
      name
    });
    expect(findBy).toHaveBeenCalledTimes(2);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      id: In([
        expressionId
      ]),
      systemId,
      canonical: expect.objectContaining({
        _multipleParameters: true,
        _objectLiteralParameters: undefined,
        _type: "raw",
        _useParameter: true,
        _value: []
      })
    });
    expect(findBy).toHaveBeenNthCalledWith(2, {
      type: SymbolType.variable,
      expressionTokens: {
        expressionId,
        systemId
      }
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
      id: expressionId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(6);
    expect(getRepository).toHaveBeenNthCalledWith(1, ExpressionEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, HypothesisEntity);
    expect(getRepository).toHaveBeenNthCalledWith(3, StatementEntity);
    expect(getRepository).toHaveBeenNthCalledWith(4, SymbolEntity);
    expect(getRepository).toHaveBeenNthCalledWith(5, SymbolEntity);
    expect(getRepository).toHaveBeenNthCalledWith(6, SymbolEntity);
    expect(getRepository).toHaveBeenNthCalledWith
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
