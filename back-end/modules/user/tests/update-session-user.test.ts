import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { existsByMock } from '@/common/tests/mocks/exists-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';

describe('Update Session User', (): void => {
  const existsBy = existsByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('PATCH /user/session-user', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const newHandle = 'NewTest1 NewUser1';
    const newEmail = 'newtest1.newuser1@example.com';
    const newPassword = 'NewTest1NewUser1!';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const updatedUser = validatePayload({
      id: userId,
      handle: newHandle,
      email: newEmail,
      passwordHash: hashSync(newPassword)
    }, UserEntity);

    existsBy.mockResolvedValueOnce(false);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    save.mockResolvedValueOnce(updatedUser);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
      `token=${token}`
    ]).send({
      newHandle,
      newEmail,
      newPassword
    });

    expect(existsBy).toHaveBeenCalledTimes(2);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      handle: newHandle
    });
    expect(existsBy).toHaveBeenNthCalledWith(2, {
      email: newEmail
    });
    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      id: userId,
      handle: newHandle,
      email: newEmail,
      passwordHash: expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
    });
    expect(response.body).toStrictEqual(instanceToPlain(updatedUser));
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql mutation updateUser', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const newHandle = 'NewTest1 NewUser1';
    const newEmail = 'newtest1.newuser1@example.com';
    const newPassword = 'NewTest1NewUser1!';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const updatedUser = validatePayload({
      id: userId,
      handle: newHandle,
      email: newEmail,
      passwordHash: hashSync(newPassword)
    }, UserEntity);

    existsBy.mockResolvedValueOnce(false);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    save.mockResolvedValueOnce(updatedUser);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation ($userPayload: EditUserPayload!) { updateUser(userPayload: $userPayload) { id handle email } }',
      variables: {
        userPayload: {
          newHandle,
          newEmail,
          newPassword
        }
      }
    });

    expect(existsBy).toHaveBeenCalledTimes(2);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      handle: newHandle
    });
    expect(existsBy).toHaveBeenNthCalledWith(2, {
      email: newEmail
    });
    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      id: userId,
      handle: newHandle,
      email: newEmail,
      passwordHash: expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
    });
    expect(response.body).toStrictEqual({
      data: {
        updateUser: instanceToPlain(updatedUser)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
