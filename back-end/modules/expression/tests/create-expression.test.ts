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
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { In } from 'typeorm';

describe('Create Expression', (): void => {
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

  it('POST /system/:system/expression', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const symbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const expressionId = 'cfe59823-eb13-4faf-a90b-c5e82022821f';
    const canonical = [
      symbolId
    ];
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
    const expression = validatePayload({
      id: expressionId,
      systemId,
      canonical
    }, ExpressionEntity);
    const expressionToken = validatePayload({
      systemId,
      symbolId,
      expressionId,
      position: 0
    }, ExpressionTokenEntity);

    countBy.mockResolvedValueOnce(1);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    save.mockResolvedValueOnce(expression);
    save.mockResolvedValueOnce([
      expressionToken
    ]);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/expression`).set('Cookie', [
      `token=${token}`
    ]).send({
      canonical
    });

    expect(countBy).toHaveBeenCalledTimes(1);
    expect(countBy).toHaveBeenNthCalledWith(1, {
      id: In(canonical),
      systemId
    });
    expect(existsBy).toHaveBeenCalledTimes(1);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      systemId,
      canonical
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(2);
    expect(getRepository).toHaveBeenNthCalledWith(1, ExpressionEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, ExpressionTokenEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenNthCalledWith(1, {
      systemId,
      canonical
    });
    expect(save).toHaveBeenNthCalledWith(2, [
      expressionToken
    ]);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual(instanceToPlain(expression));
    expect(response.statusCode).toBe(HttpStatus.CREATED);
  });

  it('POST /graphql mutation createExpression', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const symbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const expressionId = 'cfe59823-eb13-4faf-a90b-c5e82022821f';
    const canonical = [
      symbolId
    ];
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
    const expression = validatePayload({
      id: expressionId,
      systemId,
      canonical
    }, ExpressionEntity);
    const expressionToken = validatePayload({
      systemId,
      symbolId,
      expressionId,
      position: 0
    }, ExpressionTokenEntity);

    countBy.mockResolvedValueOnce(1);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    save.mockResolvedValueOnce(expression);
    save.mockResolvedValueOnce([
      expressionToken
    ]);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation ($systemId: String!, $expressionPayload: NewExpressionPayload!) { createExpression(systemId: $systemId, expressionPayload: $expressionPayload) { id systemId canonical } }',
      variables: {
        systemId,
        expressionPayload: {
          canonical
        }
      }
    });

    expect(countBy).toHaveBeenCalledTimes(1);
    expect(countBy).toHaveBeenNthCalledWith(1, {
      id: In(canonical),
      systemId
    });
    expect(existsBy).toHaveBeenCalledTimes(1);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      systemId,
      canonical
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(2);
    expect(getRepository).toHaveBeenNthCalledWith(1, ExpressionEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, ExpressionTokenEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenNthCalledWith(1, {
      systemId,
      canonical
    });
    expect(save).toHaveBeenNthCalledWith(2, [
      expressionToken
    ]);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual(instanceToPlain(expression));
    expect(response.statusCode).toBe(HttpStatus.CREATED);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
