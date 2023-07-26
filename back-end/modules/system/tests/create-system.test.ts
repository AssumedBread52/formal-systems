import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';
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

describe('Create System', (): void => {
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
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: '123456'
    });
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'post', '/system');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    const authService = app.get(AuthService);
  
    const token = await authService.generateToken(new ObjectId());
  
    const response = await request(app.getHttpServer()).post('/system').set('Cookie', [
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
  
    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);
  
    const { _id } = userRepositoryMock.entities[0];
  
    const token = await authService.generateToken(_id);
  
    await new Promise((resolve: (value: unknown) => void): NodeJS.Timeout => {
      return setTimeout(resolve, 2000);
    });
  
    const response = await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]);
  
    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toEqual({
      message: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const authService = app.get(AuthService);
  
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
  
    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);
  
    const { _id } = userRepositoryMock.entities[0];
  
    const token = await authService.generateToken(_id);

    const response = await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]);

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: [
        'title should not be empty',
        'description should not be empty'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('succeeds if the title is unique for this user', async (): Promise<void> => {
    const authService = app.get(AuthService);
  
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
  
    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);
  
    const { _id } = userRepositoryMock.entities[0];
  
    const token = await authService.generateToken(_id);

    const response = await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'System'
    });

    expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(response.body).toEqual({});
  });

  it('fails if the title is not unique for this user', async (): Promise<void> => {
    const newSystemPayload = {
      title: 'Test',
      description: 'This is a test.'
    };

    const authService = app.get(AuthService);
  
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
  
    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);
  
    const { _id } = userRepositoryMock.entities[0];
  
    const token = await authService.generateToken(_id);

    const response = await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send(newSystemPayload);

    expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(response.body).toEqual({});

    const collision = await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send(newSystemPayload);

    expect(collision.statusCode).toBe(HttpStatus.CONFLICT);
    expect(collision.body).toEqual({
      error: 'Conflict',
      message: 'Systems created by the same user must have a unique title.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  afterEach((): void => {
    const systemRepository = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    systemRepository.entities = [];
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
