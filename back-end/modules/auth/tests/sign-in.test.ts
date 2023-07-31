import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import * as request from 'supertest';
import { expectAuthCookies } from './helpers/expect-auth-cookies';

describe('Sign In', (): void => {
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
      email: 'test@test.com',
      password: '123456'
    });

    expectCorrectResponse(response, HttpStatus.UNAUTHORIZED, {
      error: 'Unauthorized',
      message: 'Invalid e-mail address or password.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with an incorrect password', async (): Promise<void> => {
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
      email: 'test@test.com',
      password: '123456'
    });

    expectCorrectResponse(response, HttpStatus.UNAUTHORIZED, {
      error: 'Unauthorized',
      message: 'Invalid e-mail address or password.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('succeeds when credentials are correct', async (): Promise<void> => {
    const testUser = new UserEntity();

    testUser.hashedPassword = await hash('123456', 12);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
      email: 'test@test.com',
      password: '123456'
    });

    expectCorrectResponse(response, HttpStatus.NO_CONTENT, {});
    expectAuthCookies(response);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
