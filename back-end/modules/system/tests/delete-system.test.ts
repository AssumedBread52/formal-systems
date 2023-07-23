import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';
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

describe('Delete System', (): void => {
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
  
    const { _id } = userRepositoryMock.users[0];
  
    const token = await authService.generateToken(_id);

    await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.'
    });
  });

  it('fails without a token', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).delete(`/system/${new ObjectId()}`);
  
    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toEqual({
      message: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with an invalid token', async (): Promise<void> => {
    const authService = app.get(AuthService);
  
    const token = await authService.generateToken(new ObjectId());
  
    const response = await request(app.getHttpServer()).delete(`/system/${new ObjectId()}`).set('Cookie', [
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
    const authService = app.get(AuthService);
  
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
  
    expect(userRepositoryMock.users.length).toBeGreaterThan(0);
  
    const { _id } = userRepositoryMock.users[0];
  
    const token = await authService.generateToken(_id);
  
    await new Promise((resolve: (value: unknown) => void): NodeJS.Timeout => {
      return setTimeout(resolve, 2000);
    });
  
    const response = await request(app.getHttpServer()).delete(`/system/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]);
  
    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toEqual({
      message: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('succeeds if the system does not exist', async (): Promise<void> => {
    const authService = app.get(AuthService);
  
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
  
    expect(userRepositoryMock.users.length).toBeGreaterThan(0);
  
    const { _id } = userRepositoryMock.users[0];
  
    const token = await authService.generateToken(_id);

    const systemId = new ObjectId();

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}`).set('Cookie', [
      `token=${token}`
    ]);

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      id: systemId.toString()
    });
  });

  it('fails if the system createdByUserId does not match the user ID in the token', async (): Promise<void> => {
    const authService = app.get(AuthService);
  
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
  
    expect(userRepositoryMock.users.length).toBeGreaterThan(1);
  
    const { _id: userId } = userRepositoryMock.users[1];
  
    const token = await authService.generateToken(userId);

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    expect(systemRepositoryMock.systems.length).toBeGreaterThan(0);

    const { _id } = systemRepositoryMock.systems[0];

    const response = await request(app.getHttpServer()).delete(`/system/${_id}`).set('Cookie', [
      `token=${token}`
    ]);

    expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    expect(response.body).toEqual({
      error: 'Forbidden',
      message: 'You cannot delete entities unless you created them.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('succeeds if the system createdByUserId matches the user ID in the token', async (): Promise<void> => {
    const authService = app.get(AuthService);
  
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
  
    expect(userRepositoryMock.users.length).toBeGreaterThan(0);
  
    const { _id: userId } = userRepositoryMock.users[0];
  
    const token = await authService.generateToken(userId);

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    expect(systemRepositoryMock.systems.length).toBeGreaterThan(0);

    const { _id } = systemRepositoryMock.systems[0];

    const response = await request(app.getHttpServer()).delete(`/system/${_id}`).set('Cookie', [
      `token=${token}`
    ]);

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toEqual({
      id: _id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
