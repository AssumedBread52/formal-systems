import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { expectAuthCookies } from '@/auth/tests/helpers/expect-auth-cookies';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';

describe('Create New User', (): void => {
  const getOrThrow = getOrThrowMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/user');

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'firstName should not be empty',
        'lastName should not be empty',
        'email must be an email',
        'password should not be empty'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with e-mail address collision', async (): Promise<void> => {
    const email = 'test@example.com';

    const conflictUser = new UserEntity();

    conflictUser.email = email;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(conflictUser);

    const response = await request(app.getHttpServer()).post('/user').send({
      firstName: 'Test',
      lastName: 'User',
      email,
      password: '123456'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Users must have a unique e-mail address.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds', async (): Promise<void> => {
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(null);
    getOrThrow.mockReturnValueOnce('1000');

    const response = await request(app.getHttpServer()).post('/user').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: '123456'
    });

    expectCorrectResponse(response, HttpStatus.CREATED, {});
    expectAuthCookies(response);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
