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
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { generateToken } from './helpers/generate-token';
import { testWithExpiredToken } from './helpers/test-with-expired-token';

describe('Refresh Token', (): void => {
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

    await request(app.getHttpServer()).post('/auth/sign-up').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: '123456'
    });
  });

  it('fails without a token', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/auth/refresh-token');
  
    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toEqual({
      message: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with an invalid token', async (): Promise<void> => {
    const authService = app.get(AuthService);
  
    const token = await authService.generateToken(new ObjectId());
  
    const response = await request(app.getHttpServer()).post('/auth/refresh-token').set('Cookie', [
      `token=${token}`
    ]);
  
    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toEqual({
      error: 'Unauthorized',
      message: 'Invalid token.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testWithExpiredToken(app, 'post', '/auth/refresh-token');
  });

  it('succeeds with valid token', async (): Promise<void> => {
    const token = await generateToken(app);

    const response = await request(app.getHttpServer()).post('/auth/refresh-token').set('Cookie', [
      `token=${token}`
    ]);

    expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(response.body).toEqual({});

    const cookies = response.get('Set-Cookie');
  
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toMatch(/^token=.+; Max-Age=60; .+; HttpOnly; Secure$/);
    expect(cookies[1]).toMatch(/^authStatus=true; Max-Age=60; .+; Secure$/);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
