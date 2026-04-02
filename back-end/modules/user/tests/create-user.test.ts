import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { existsByMock } from '@/common/tests/mocks/exists-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import * as request from 'supertest';

describe('Create User', (): void => {
  const existsBy = existsByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /user', async (): Promise<void> => {
    const handle = 'Test1 User1';
    const email = 'test1.user1@example.com';
    const password = 'Test1User1!';
    const user = validatePayload({
      id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
      handle,
      email,
      passwordHash: hashSync(password)
    }, UserEntity);

    existsBy.mockResolvedValueOnce(false);
    existsBy.mockResolvedValueOnce(false);
    getOrThrow.mockReturnValueOnce(1000);
    save.mockResolvedValueOnce(user);

    const response = await request(app.getHttpServer()).post('/user').send({
      handle,
      email,
      password
    });

    const cookies = response.get('Set-Cookie');

    expect(existsBy).toHaveBeenCalledTimes(2);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      handle
    });
    expect(existsBy).toHaveBeenNthCalledWith(2, {
      email
    });
    expect(getOrThrow).toHaveBeenCalledTimes(1);
    expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      handle,
      email,
      passwordHash: expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
    });
    expect(response.body).toStrictEqual(instanceToPlain(user));
    expect(response.statusCode).toBe(HttpStatus.CREATED);
    expect(cookies).toBeDefined();
    expect(cookies).toHaveLength(2);
    expect(cookies![0]).toMatch(/^token=.+; Max-Age=1; Path=\/; Expires=(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (0[1-9]|[12]\d|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} ([01]\d|2[0-3]):([0-5]\d):([0-5]\d) GMT; HttpOnly; Secure$/);
    expect(cookies![1]).toMatch(/^authStatus=true; Max-Age=1; Path=\/; Expires=(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (0[1-9]|[12]\d|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} ([01]\d|2[0-3]):([0-5]\d):([0-5]\d) GMT; Secure$/);
  });

  it('POST /graphql mutation createUser', async (): Promise<void> => {
    const handle = 'Test1 User1';
    const email = 'test1.user1@example.com';
    const password = 'Test1User1!';
    const user = validatePayload({
      id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
      handle,
      email,
      passwordHash: hashSync(password)
    }, UserEntity);

    existsBy.mockResolvedValueOnce(false);
    existsBy.mockResolvedValueOnce(false);
    getOrThrow.mockReturnValueOnce(1000);
    save.mockResolvedValueOnce(user);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'mutation ($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id handle email } }',
      variables: {
        userPayload: {
          handle,
          email,
          password
        }
      }
    });

    const cookies = response.get('Set-Cookie');

    expect(existsBy).toHaveBeenCalledTimes(2);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      handle
    });
    expect(existsBy).toHaveBeenNthCalledWith(2, {
      email
    });
    expect(getOrThrow).toHaveBeenCalledTimes(1);
    expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      handle,
      email,
      passwordHash: expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/)
    });
    expect(response.body).toStrictEqual({
      data: {
        createUser: instanceToPlain(user)
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
