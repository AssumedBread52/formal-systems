import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { generateToken } from '@/auth/tests/helpers/generate-token';
import { testWithExpiredToken } from '@/auth/tests/helpers/test-with-expired-token';
import { testWithInvalidToken } from '@/auth/tests/helpers/test-with-invalid-token';
import { testWithMissingToken } from '@/auth/tests/helpers/test-with-missing-token';
import { SystemEntity } from '@/system/system.entity';
import { SystemRepositoryMock } from '@/system/tests/mocks/system-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { UserModule } from '@/user/user.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { UserRepositoryMock } from './mocks/user-repository.mock';

describe('Read Session User', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AuthModule,
        UserModule
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
    await testWithMissingToken(app, 'get', '/user/session-user');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testWithInvalidToken(app, 'get', '/user/session-user');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testWithExpiredToken(app, 'get', '/user/session-user');
  });

  it('succeeds with a valid token', async (): Promise<void> => {
    const token = await generateToken(app);

    const response = await request(app.getHttpServer()).get('/user/session-user').set('Cookie', [
      `token=${token}`
    ]);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      id: userRepositoryMock.users[0]._id.toString(),
      firstName: userRepositoryMock.users[0].firstName,
      lastName: userRepositoryMock.users[0].lastName,
      email: userRepositoryMock.users[0].email,
      systemCount: userRepositoryMock.users[0].systemCount,
      constantSymbolCount: userRepositoryMock.users[0].constantSymbolCount,
      variableSymbolCount: userRepositoryMock.users[0].variableSymbolCount
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
