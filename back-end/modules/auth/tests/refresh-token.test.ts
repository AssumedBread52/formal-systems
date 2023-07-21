import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';
import { SystemEntity } from '@/system/system.entity';
import { SystemRepositoryMock } from '@/system/tests/mocks/system-repository.mock';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { testWithInvalidToken } from './helpers/test-with-invalid-token';
import { testWithMissingToken } from './helpers/test-with-missing-token';
import { testWithExpiredToken } from './helpers/test-with-expired-token';

describe('Refresh Token', (): void => {
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

    app.use(cookieParser());

    await app.init();

    await request(app.getHttpServer()).post('/auth/sign-up').send(signUpPayload);
  });

  it('fails without a token', async (): Promise<void> => {
    await testWithMissingToken(app, '/auth/refresh-token');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testWithInvalidToken(app, '/auth/refresh-token');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testWithExpiredToken(app, '/auth/refresh-token');
  });

  it('succeeds with valid token', async (): Promise<void> => {
    const authService = app.get(AuthService);
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    expect(userRepositoryMock.users.length).toBeGreaterThan(0);

    const token = await authService.generateToken(userRepositoryMock.users[0]._id);

    const response = await request(app.getHttpServer()).post('/auth/refresh-token').set('Cookie', [
      `token=${token}`
    ]);

    const cookies = response.get('Set-Cookie');

    expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(response.body).toEqual({});
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toMatch(/token=.+; Max-Age=60; .+; HttpOnly; Secure/);
    expect(cookies[1]).toMatch(/authStatus=true; Max-Age=60; .+; Secure/);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
