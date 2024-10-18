import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { hashSync } from 'bcryptjs';
import * as request from 'supertest';

describe('Sign In', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/auth/sign-in');

    const { statusCode, body } = response;
    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(0);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body).toEqual({
      message: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED
    });
    expect(cookies).toBeUndefined();
  });

  it('fails when the e-mail address does not match a user', async (): Promise<void> => {
    const email = 'test@example.com';

    findOneBy.mockResolvedValueOnce(null);

    const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
      email,
      password: '123456'
    });

    const { statusCode, body } = response;
    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      email
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body).toEqual({
      error: 'Unauthorized',
      message: 'Invalid e-mail address or password.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
    expect(cookies).toBeUndefined();
  });

  it('fails with an incorrect password', async (): Promise<void> => {
    const email = 'test@example.com';
    const password = '123456';
    const user = new UserEntity();

    user.email = email;
    user.hashedPassword = hashSync(password, 12);

    findOneBy.mockResolvedValueOnce(user);

    const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
      email,
      password: 'password'
    });

    const { statusCode, body } = response;
    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      email
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body).toEqual({
      error: 'Unauthorized',
      message: 'Invalid e-mail address or password.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
    expect(cookies).toBeUndefined();
  });

  it('succeeds', async (): Promise<void> => {
    const email = 'test@example.com';
    const password = '123456';
    const user = new UserEntity();

    user.email = email;
    user.hashedPassword = hashSync(password, 12);

    findOneBy.mockResolvedValueOnce(user);
    getOrThrow.mockReturnValueOnce(1000);

    const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
      email,
      password
    });

    const { statusCode, body } = response;
    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      email
    });
    expect(getOrThrow).toHaveBeenCalledTimes(1);
    expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
    expect(statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(body).toEqual({});
    expect(cookies).toBeDefined();
    expect(cookies).toHaveLength(2);
    expect(cookies![0]).toMatch(/^token=.+; Max-Age=1; .+; HttpOnly; Secure$/);
    expect(cookies![1]).toMatch(/^authStatus=true; Max-Age=1; .+; Secure$/);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
