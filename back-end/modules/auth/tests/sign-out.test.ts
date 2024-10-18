import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Sign Out', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/auth/sign-out');

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

  it('fails with an expired token', async (): Promise<void> => {
    const token = app.get(JwtService).sign({
      id: new ObjectId()
    });

    await new Promise((resolve: (value: unknown) => void): void => {
      setTimeout(resolve, 1000);
    });

    const response = await request(app.getHttpServer()).post('/auth/sign-out').set('Cookie', [
      `token=${token}`
    ]);

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

  it('fails with an invalid token', async (): Promise<void> => {
    const token = app.get(JwtService).sign({
      id: 1
    });

    const response = await request(app.getHttpServer()).post('/auth/sign-out').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;
    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(0);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body).toEqual({
      error: 'Unauthorized',
      message: 'Invalid token.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
    expect(cookies).toBeUndefined();
  });

  it('fails if the user ID in the token payload does not match a user', async (): Promise<void> => {
    const userId = new ObjectId();

    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).post('/auth/sign-out').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;
    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body).toEqual({
      error: 'Unauthorized',
      message: 'Invalid token.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
    expect(cookies).toBeUndefined();
  });

  it('succeeds', async (): Promise<void> => {
    const userId = new ObjectId();
    const user = new UserEntity();

    user._id = userId;

    findOneBy.mockResolvedValueOnce(user);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).post('/auth/sign-out').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;
    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(body).toEqual({});
    expect(cookies).toBeDefined();
    expect(cookies).toHaveLength(2);
    expect(cookies![0]).toBe('token=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    expect(cookies![1]).toBe('authStatus=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
