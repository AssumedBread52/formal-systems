import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { removeMock } from '@/common/tests/mocks/remove.mock';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';

describe('Delete Distinct Variable Pair', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const remove = removeMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('DELETE /system/:systemId/statement/:statementId/distinct-variable-pair/:variableSymbol1Id/:variableSymbol2Id', async (): Promise<void> => {
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
    const distinctVariablePair = validatePayload({
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    }, DistinctVariablePairEntity);

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(distinctVariablePair);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    remove.mockResolvedValueOnce(distinctVariablePair);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/statement/${statementId}/distinct-variable-pair/${variableSymbol1Id}/${variableSymbol2Id}`).set('Cookie', [
      `token=${token}`
    ]);

    expect(findOneBy).toHaveBeenCalledTimes(4);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenNthCalledWith(1, distinctVariablePair);
    expect(response.body).toStrictEqual(instanceToPlain(distinctVariablePair));
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql mutation deleteDistinctVariablePair', async (): Promise<void> => {
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
    const distinctVariablePair = validatePayload({
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    }, DistinctVariablePairEntity);

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(distinctVariablePair);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    remove.mockResolvedValueOnce(distinctVariablePair);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation ($systemId: String!, $statementId: String!, $variableSymbol1Id: String!, $variableSymbol2Id: String!) { deleteDistinctVariablePair(systemId: $systemId, statementId: $statementId, variableSymbol1Id: $variableSymbol1Id, variableSymbol2Id: $variableSymbol2Id) { systemId statementId variableSymbol1Id variableSymbol2Id } }',
      variables: {
        systemId,
        statementId,
        variableSymbol1Id,
        variableSymbol2Id
      }
    });

    expect(findOneBy).toHaveBeenCalledTimes(4);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenNthCalledWith(1, distinctVariablePair);
    expect(response.body).toStrictEqual({
      data: {
        deleteDistinctVariablePair: instanceToPlain(distinctVariablePair)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
