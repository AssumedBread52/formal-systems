import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/testExpiredToken';
import { testInvalidToken } from '@/auth/tests/helpers/testInvalidToken';
import { testMissingToken } from '@/auth/tests/helpers/testMissingToken';
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

describe('Update Session User', (): void => {
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
      firstName: 'Test1',
      lastName: 'User1',
      email: 'test1@test.com',
      password: '123456'
    });

    await request(app.getHttpServer()).post('/auth/sign-up').send({
      firstName: 'Test2',
      lastName: 'User2',
      email: 'test2@test.com',
      password: '123456'
    });
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'patch', '/user/session-user');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'patch', '/user/session-user');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'patch', '/user/session-user');
  });

  it('fails with an invalid update payload', async (): Promise<void> => {
    const authService = app.get(AuthService);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);

    const { _id } = userRepositoryMock.entities[0];

    const token = await authService.generateToken(_id);

    const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
      `token=${token}`
    ]);

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: [
        'newFirstName should not be empty',
        'newLastName should not be empty',
        'newEmail must be an email'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails if new e-mail address is already in use', async (): Promise<void> => {
    const authService = app.get(AuthService);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);

    const { _id } = userRepositoryMock.entities[0];

    const token = await authService.generateToken(_id);

    const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
      `token=${token}`
    ]).send({
      newFirstName: 'Example',
      newLastName: 'Case',
      newEmail: 'test2@test.com',
      newPassword: 'qwerty'
    });

    expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    expect(response.body).toEqual({
      error: 'Conflict',
      message: 'Users must have a unique e-mail address.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds with a valid token and payload', async (): Promise<void> => {
    const authService = app.get(AuthService);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);

    const { _id } = userRepositoryMock.entities[0];

    const token = await authService.generateToken(_id);

    const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
      `token=${token}`
    ]).send({
      newFirstName: 'Example',
      newLastName: 'Case',
      newEmail: 'new@test.com',
      newPassword: 'qwerty'
    });

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      id: userRepositoryMock.entities[0]._id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
