import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';
import { SystemEntity } from '@/system/system.entity';
import { SystemRepositoryMock } from '@/system/tests/mocks/system-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { UserModule } from '@/user/user.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as cookieParser from 'cookie-parser';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { UserRepositoryMock } from './mocks/user-repository.mock';
import { compareSync } from 'bcryptjs';

describe('Update Session User', (): void => {
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
        AuthModule,
        UserModule
      ]
    }).overrideProvider(ConfigService).useClass(ConfigServiceMock).overrideProvider(getRepositoryToken(SystemEntity)).useClass(SystemRepositoryMock).overrideProvider(getRepositoryToken(UserEntity)).useClass(UserRepositoryMock).compile();

    app = moduleRef.createNestApplication();

    app.use(cookieParser());

    await app.init();

    await request(app.getHttpServer()).post('/auth/sign-up').send(signUpPayload);
  });

  it('fails without a token', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).patch('/user/session-user');

    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toEqual({
      message: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with token that has an invalid user id', async (): Promise<void> => {
    const authService = app.get(AuthService);

    const token = await authService.generateToken(new ObjectId());

    const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
      `token=${token}`
    ]);

    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toEqual({
      error: 'Unauthorized',
      message: 'Invalid token.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with an invalid update payload', async (): Promise<void> => {
    const authService = app.get(AuthService);
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    expect(userRepositoryMock.users.length).toBeGreaterThan(0);

    const token = await authService.generateToken(userRepositoryMock.users[0]._id);

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

  it('succeeds with a valid token and payload', async (): Promise<void> => {
    const authService = app.get(AuthService);
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    expect(userRepositoryMock.users.length).toBeGreaterThan(0);

    const token = await authService.generateToken(userRepositoryMock.users[0]._id);

    const editProfilePayload = {
      newFirstName: 'Example',
      newLastName: 'Case',
      newEmail: 'new@test.com',
      newPassword: 'qwerty'
    };

    const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
      `token=${token}`
    ]).send(editProfilePayload);

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      id: userRepositoryMock.users[0]._id.toString()
    });
    expect(userRepositoryMock.users[0].firstName).toBe(editProfilePayload.newFirstName);
    expect(userRepositoryMock.users[0].lastName).toBe(editProfilePayload.newLastName);
    expect(userRepositoryMock.users[0].email).toBe(editProfilePayload.newEmail);
    expect(compareSync(editProfilePayload.newPassword, userRepositoryMock.users[0].hashedPassword)).toBe(true);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});