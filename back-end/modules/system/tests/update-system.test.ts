import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { existsByMock } from '@/common/tests/mocks/exists-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';

describe('Update System', (): void => {
  const existsBy = existsByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('PATCH /system/:systemId', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const newName = 'NewTestSystem1';
    const newDescription = 'New Test System 1';
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
    const updatedSystem = validatePayload({
      id: systemId,
      ownerUserId: userId,
      name: newName,
      description: newDescription
    }, SystemEntity);

    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(user);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newName,
      newDescription
    });

    expect(existsBy).toHaveBeenCalledTimes(1);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      ownerUserId: userId,
      name: newName
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, updatedSystem);
    expect(response.body).toStrictEqual(instanceToPlain(updatedSystem));
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql mutation updateSystem', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const newName = 'NewTestSystem1';
    const newDescription = 'New Test System 1';
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
    const updatedSystem = validatePayload({
      id: systemId,
      ownerUserId: userId,
      name: newName,
      description: newDescription
    }, SystemEntity);

    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(user);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation ($systemId: String!, $systemPayload: EditSystemPayload!) { updateSystem(systemId: $systemId, systemPayload: $systemPayload) { id ownerUserId name description } }',
      variables: {
        systemId,
        systemPayload: {
          newName,
          newDescription
        }
      }
    });

    expect(existsBy).toHaveBeenCalledTimes(1);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      ownerUserId: userId,
      name: newName
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, updatedSystem);
    expect(response.body).toStrictEqual({
      data: {
        updateSystem: instanceToPlain(updatedSystem)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
