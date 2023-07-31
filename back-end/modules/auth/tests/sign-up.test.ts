import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { expectAuthCookies } from './helpers/expect-auth-cookies';

describe('Sign Up', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails with invalid payload', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/auth/sign-up');

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
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const response = await request(app.getHttpServer()).post('/auth/sign-up').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: '123456'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Users must have a unique e-mail address.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds without an e-mail address collision', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/auth/sign-up').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: '123456'
    });

    expectCorrectResponse(response, HttpStatus.CREATED, {});
    expectAuthCookies(response);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
