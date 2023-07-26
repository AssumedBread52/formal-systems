import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/testExpiredToken';
import { testMissingToken } from '@/auth/tests/helpers/testMissingToken';
import { SystemEntity } from '@/system/system.entity';
import { SystemModule } from '@/system/system.module';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as cookieParser from 'cookie-parser';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SystemRepositoryMock } from './mocks/system-repository.mock';
import { testInvalidToken } from '@/auth/tests/helpers/testInvalidToken';

describe('Update System', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AuthModule,
        SystemModule
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

    const authService = app.get(AuthService);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    const { _id } = userRepositoryMock.entities[0];

    const token = await authService.generateToken(_id);

    await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test1',
      description: 'This is a test.'
    });

    await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test2',
      description: 'This is a test.'
    });
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'patch', `/system/${new ObjectId()}`);
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'patch', `/system/${new ObjectId()}`);
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'patch', `/system/${new ObjectId()}`);
  });

  it('fails with an invalid update payload', async (): Promise<void> => {
    const authService = app.get(AuthService);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);

    const { _id } = userRepositoryMock.entities[0];

    const token = await authService.generateToken(_id);

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]);

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: [
        'newTitle should not be empty',
        'newDescription should not be empty'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid system ID', async (): Promise<void> => {
    const authService = app.get(AuthService);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);

    const { _id } = userRepositoryMock.entities[0];

    const token = await authService.generateToken(_id);

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Title',
      newDescription: 'New Description'
    });

    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body).toEqual({
      error: 'Not Found',
      message: 'System not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails when updating a system the user did not create', async (): Promise<void> => {
    const authService = app.get(AuthService);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    expect(userRepositoryMock.entities.length).toBeGreaterThan(1);

    const { _id: userId } = userRepositoryMock.entities[1];

    const token = await authService.generateToken(userId);

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    expect(systemRepositoryMock.entities.length).toBeGreaterThan(0);

    const { _id } = systemRepositoryMock.entities[0];

    const response = await request(app.getHttpServer()).patch(`/system/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Title',
      newDescription: 'New Description'
    });

    expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    expect(response.body).toEqual({
      error: 'Forbidden',
      message: 'You cannot update entities unless you created them.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails when updating the title to a value in use by a system created by that user', async (): Promise<void> => {
    const authService = app.get(AuthService);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);

    const { _id: userId } = userRepositoryMock.entities[0];

    const token = await authService.generateToken(userId);

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    expect(systemRepositoryMock.entities.length).toBeGreaterThan(1);

    const { _id } = systemRepositoryMock.entities[0];
    const { title } = systemRepositoryMock.entities[1];

    const response = await request(app.getHttpServer()).patch(`/system/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: title,
      newDescription: 'New Description'
    });

    expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    expect(response.body).toEqual({
      error: 'Conflict',
      message: 'Systems created by the same user must have a unique title.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds with a valid token, a valid payload, and non-conflicting title', async (): Promise<void> => {
    const authService = app.get(AuthService);

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);

    const { _id: userId } = userRepositoryMock.entities[0];

    const token = await authService.generateToken(userId);

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    expect(systemRepositoryMock.entities.length).toBeGreaterThan(1);

    const { _id } = systemRepositoryMock.entities[0];

    const response = await request(app.getHttpServer()).patch(`/system/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Title',
      newDescription: 'New Description'
    });

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      id: _id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
