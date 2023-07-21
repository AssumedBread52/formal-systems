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
import { expectBadAuthPayloadResponse } from './helpers/expect-bad-auth-payload-response';
import { expectSetToken } from './helpers/expect-set-token';

describe('Sign In', (): void => {
  const signUpPayload = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@test.com',
    password: '123456'
  };
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AuthModule
      ]
    }).overrideProvider(ConfigService).useClass(ConfigServiceMock).overrideProvider(getRepositoryToken(SystemEntity)).useClass(SystemRepositoryMock).overrideProvider(getRepositoryToken(UserEntity)).useClass(UserRepositoryMock).compile();

    app = moduleRef.createNestApplication();

    await app.init();

    await request(app.getHttpServer()).post('/auth/sign-up').send(signUpPayload);
  });

  it('fails with invalid payload', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/auth/sign-in');

    expectBadAuthPayloadResponse(response);
  });

  it('fails with incorrect e-mail address', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
      email: signUpPayload.email + 'extra',
      password: signUpPayload.password
    });

    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toEqual({
      error: 'Unauthorized',
      message: 'Invalid e-mail address or password.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with incorrect password', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
      email: signUpPayload.email,
      password: signUpPayload.password + 'extra'
    });

    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toEqual({
      error: 'Unauthorized',
      message: 'Invalid e-mail address or password.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('succeeds with correct e-mail address and password', async (): Promise<void> => {
    const { email, password } = signUpPayload;

    const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
      email,
      password
    });

    expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(response.body).toEqual({});
    expectSetToken(response);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
