import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';

describe('Sign Out', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /auth/sign-out', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);

    findOneBy.mockResolvedValueOnce(user);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/auth/sign-out').set('Cookie', [
      `token=${token}`
    ]);

    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
    });
    expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(cookies).toBeDefined();
    expect(cookies).toHaveLength(2);
    expect(cookies![0]).toBe('token=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    expect(cookies![1]).toBe('authStatus=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  });

  it('POST /graphql mutation signOut', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);

    findOneBy.mockResolvedValueOnce(user);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation { signOut { id handle email } }'
    });

    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        signOut: instanceToPlain(user)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(cookies).toBeDefined();
    expect(cookies).toHaveLength(2);
    expect(cookies![0]).toBe('token=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    expect(cookies![1]).toBe('authStatus=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
