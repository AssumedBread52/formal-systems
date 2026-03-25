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
import * as request from 'supertest';

describe('Refresh Token', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /auth/refresh-token', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);

    findOneBy.mockResolvedValueOnce(user);
    getOrThrow.mockReturnValueOnce(1000);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/auth/refresh-token').set('Cookie', [
      `token=${token}`
    ]);

    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(1);
    expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
    expect(response.body).toStrictEqual({
    });
    expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(cookies).toBeDefined();
    expect(cookies).toHaveLength(2);
    expect(cookies![0]).toMatch(/^token=.+; Max-Age=1; Path=\/; Expires=(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (0[1-9]|[12]\d|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} ([01]\d|2[0-3]):([0-5]\d):([0-5]\d) GMT; HttpOnly; Secure$/);
    expect(cookies![1]).toMatch(/^authStatus=true; Max-Age=1; Path=\/; Expires=(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (0[1-9]|[12]\d|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} ([01]\d|2[0-3]):([0-5]\d):([0-5]\d) GMT; Secure$/);
  });

  it('POST /graphql mutation refreshToken', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);

    findOneBy.mockResolvedValueOnce(user);
    getOrThrow.mockReturnValueOnce(1000);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation { refreshToken { id handle email } }'
    });

    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(1);
    expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
    expect(response.body).toStrictEqual({
      data: {
        refreshToken: instanceToPlain(user)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(cookies).toBeDefined();
    expect(cookies).toHaveLength(2);
    expect(cookies![0]).toMatch(/^token=.+; Max-Age=1; Path=\/; Expires=(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (0[1-9]|[12]\d|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} ([01]\d|2[0-3]):([0-5]\d):([0-5]\d) GMT; HttpOnly; Secure$/);
    expect(cookies![1]).toMatch(/^authStatus=true; Max-Age=1; Path=\/; Expires=(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (0[1-9]|[12]\d|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} ([01]\d|2[0-3]):([0-5]\d):([0-5]\d) GMT; Secure$/);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
