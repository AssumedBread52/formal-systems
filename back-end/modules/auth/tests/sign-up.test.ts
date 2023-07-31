import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SystemEntity } from '@/system/system.entity';
import { SystemRepositoryMock } from '@/system/tests/mocks/system-repository.mock';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { expectAuthCookies } from './helpers/expect-auth-cookies';

describe('Sign Up', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AuthModule
      ]
    }).overrideProvider(ConfigService).useClass(ConfigServiceMock).overrideProvider(getRepositoryToken(SystemEntity)).useClass(SystemRepositoryMock).overrideProvider(getRepositoryToken(UserEntity)).useClass(UserRepositoryMock).compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  it('fails without the proper sign up payload', async (): Promise<void> => {
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

  it('fails with e-mail collision', async (): Promise<void> => {
    const signUpPayload = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: '123456'
    };

    const response = await request(app.getHttpServer()).post('/auth/sign-up').send(signUpPayload);

    expectCorrectResponse(response, HttpStatus.CREATED, {});
    expectAuthCookies(response);

    const collision = await request(app.getHttpServer()).post('/auth/sign-up').send(signUpPayload);

    expectCorrectResponse(collision, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Users must have a unique e-mail address.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds without e-mail address collision', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/auth/sign-up').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: '123456'
    });

    expectCorrectResponse(response, HttpStatus.CREATED, {});
    expectAuthCookies(response);
  });

  afterEach((): void => {
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.entities = [];
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
