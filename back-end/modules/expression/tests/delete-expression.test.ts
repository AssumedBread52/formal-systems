import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findByMock } from '@/common/tests/mocks/find-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { getRepositoryMock } from '@/common/tests/mocks/get-repository.mock';
import { managerMock } from '@/common/tests/mocks/manager.mock';
import { removeMock } from '@/common/tests/mocks/remove.mock';
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

describe('Delete Expression', (): void => {
  const findBy = findByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const getRepository = getRepositoryMock();
  const manager = managerMock();
  const remove = removeMock();
  const transaction = transactionMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('DELETE /system/:systemId/expression/:expressionId', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const symbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const expressionId = 'cfe59823-eb13-4faf-a90b-c5e82022821f';
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
      canonical: [
        symbolId
      ]
    }, ExpressionEntity);
    const expressionToken = validatePayload({
      systemId,
      symbolId,
      expressionId,
      position: 0
    }, ExpressionTokenEntity);

    findBy.mockResolvedValueOnce([
      expressionToken
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(expression);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    remove.mockResolvedValueOnce([
      expressionToken
    ]);
    remove.mockResolvedValueOnce(expression);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/expression/${expressionId}`).set('Cookie', [
      `token=${token}`
    ]);

    expect(findBy).toHaveBeenCalledTimes(1);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      systemId,
      expressionId
    });
    expect(findOneBy).toHaveBeenCalledTimes(4);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: expressionId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(2);
    expect(getRepository).toHaveBeenNthCalledWith(1, ExpressionEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, ExpressionTokenEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenNthCalledWith(1, [
      expressionToken
    ]);
    expect(remove).toHaveBeenNthCalledWith(2, expression);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual(instanceToPlain(expression));
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql mutation deleteExpression', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const symbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const expressionId = 'cfe59823-eb13-4faf-a90b-c5e82022821f';
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
      canonical: [
        symbolId
      ]
    }, ExpressionEntity);
    const expressionToken = validatePayload({
      systemId,
      symbolId,
      expressionId,
      position: 0
    }, ExpressionTokenEntity);

    findBy.mockResolvedValueOnce([
      expressionToken
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(expression);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    remove.mockResolvedValueOnce([
      expressionToken
    ]);
    remove.mockResolvedValueOnce(expression);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation ($systemId: String!, $expressionId: String!) { deleteExpression(systemId: $systemId, expressionId: $expressionId) { id systemId canonical } }',
      variables: {
        systemId,
        expressionId
      }
    });

    expect(findBy).toHaveBeenCalledTimes(1);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      systemId,
      expressionId
    });
    expect(findOneBy).toHaveBeenCalledTimes(4);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: expressionId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(2);
    expect(getRepository).toHaveBeenNthCalledWith(1, ExpressionEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, ExpressionTokenEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenNthCalledWith(1, [
      expressionToken
    ]);
    expect(remove).toHaveBeenNthCalledWith(2, expression);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual({
      data: {
        deleteExpression: instanceToPlain(expression)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
