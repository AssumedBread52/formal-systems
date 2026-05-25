import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { existsByMock } from '@/common/tests/mocks/exists-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { removeMock } from '@/common/tests/mocks/remove.mock';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { IsNull, Not } from 'typeorm';

describe('Delete System', (): void => {
  const existsBy = existsByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const remove = removeMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('DELETE /system/:systemId', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const system = validatePayload({
        id: systemId,
        ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        name: 'TestSystem1',
        description: 'Test System 1'
    }, SystemEntity);
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);

    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    remove.mockResolvedValueOnce(system);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}`).set('Cookie', [
      `token=${token}`
    ]);

    expect(existsBy).toHaveBeenCalledTimes(2);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      id: systemId,
      ownerUserId: userId
    });
    expect(existsBy).toHaveBeenNthCalledWith(2, {
      id: systemId,
      symbols: {
        id: Not(IsNull())
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenNthCalledWith(1, system);
    expect(response.body).toStrictEqual(instanceToPlain(system));
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql mutation deleteSystem', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const system = validatePayload({
        id: systemId,
        ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
        name: 'TestSystem1',
        description: 'Test System 1'
    }, SystemEntity);
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);

    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    remove.mockResolvedValueOnce(system);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation ($systemId: String!) { deleteSystem(systemId: $systemId) { id ownerUserId name description } }',
      variables: {
        systemId
      }
    });

    expect(existsBy).toHaveBeenCalledTimes(2);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      id: systemId,
      ownerUserId: userId
    });
    expect(existsBy).toHaveBeenNthCalledWith(2, {
      id: systemId,
      symbols: {
        id: Not(IsNull())
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenNthCalledWith(1, system);
    expect(response.body).toStrictEqual({
      data: {
        deleteSystem: instanceToPlain(system)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
