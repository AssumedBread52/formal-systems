import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import * as request from 'supertest';
import { expectAuthCookies } from './helpers/expect-auth-cookies';

describe('Sign In', (): void => {
  const getOrThrow = getOrThrowMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails with invalid payload', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/auth/sign-in');

    expectCorrectResponse(response, HttpStatus.UNAUTHORIZED, {
      message: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails when the e-mail address does not match a user', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
      email: 'test@example.com',
      password: '123456'
    });

    expectCorrectResponse(response, HttpStatus.UNAUTHORIZED, {
      error: 'Unauthorized',
      message: 'Invalid e-mail address or password.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with an incorrect password', async (): Promise<void> => {
    const user = new UserEntity();

    user.email = 'test@example.com';

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
      email: user.email,
      password: '123456'
    });

    expectCorrectResponse(response, HttpStatus.UNAUTHORIZED, {
      error: 'Unauthorized',
      message: 'Invalid e-mail address or password.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('succeeds', async (): Promise<void> => {
    const password = '123456';

    const user = new UserEntity();

    user.email = 'test@example.com';
    user.hashedPassword = await hash(password, 12);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);
    getOrThrow.mockReturnValueOnce('1000');

    const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
      email: user.email,
      password
    });

    expectCorrectResponse(response, HttpStatus.NO_CONTENT, {});
    expectAuthCookies(response);
    expect(getOrThrow).toHaveBeenCalledTimes(1);
    expect(getOrThrow).toHaveBeenCalledWith('AUTH_COOKIE_MAX_AGE_MILLISECONDS');
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
