import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { SystemEntity } from '@/system/system.entity';
import { SystemRepositoryMock } from '@/system/tests/mocks/system-repository.mock';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { expectSetToken } from './helpers/expect-set-token';

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

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
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

  it('succeeds without e-mail address collision', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/auth/sign-up').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: '123456'
    });

    expect(response.statusCode).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual({});
    expectSetToken(response);
  });

  it('fails with e-mail collision', async (): Promise<void> => {
    const signUpPayload = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: '123456'
    };

    const response = await request(app.getHttpServer()).post('/auth/sign-up').send(signUpPayload);

    expect(response.statusCode).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual({});
    expectSetToken(response);

    const collision = await request(app.getHttpServer()).post('/auth/sign-up').send(signUpPayload);

    expect(collision.statusCode).toBe(HttpStatus.CONFLICT);
    expect(collision.body).toEqual({
      error: 'Conflict',
      message: 'Users must have a unique e-mail address.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  afterEach((): void => {
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.users = [];
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
