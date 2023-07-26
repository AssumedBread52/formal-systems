import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/testExpiredToken';
import { testInvalidToken } from '@/auth/tests/helpers/testInvalidToken';
import { testMissingToken } from '@/auth/tests/helpers/testMissingToken';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SymbolModule } from '@/symbol/symbol.module';
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
import { SymbolRepositoryMock } from './mocks/symbol-repository.mock';

describe('Create Symbol', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AuthModule,
        SymbolModule
      ]
    }).overrideProvider(ConfigService).useClass(ConfigServiceMock).overrideProvider(getRepositoryToken(SymbolEntity)).useClass(SymbolRepositoryMock).overrideProvider(getRepositoryToken(SystemEntity)).useClass(SystemRepositoryMock).overrideProvider(getRepositoryToken(UserEntity)).useClass(UserRepositoryMock).compile();

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
      title: 'Test',
      description: 'This is a test.'
    });
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'post', `/system/${new ObjectId()}/symbol`);
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'post', `/system/${new ObjectId()}/symbol`);
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'post', `/system/${new ObjectId()}/symbol`);
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const authService = app.get(AuthService);
  
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
  
    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);
  
    const { _id } = userRepositoryMock.entities[0];
  
    const token = await authService.generateToken(_id);

    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/symbol`).set('Cookie', [
      `token=${token}`
    ]);

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: [
        'title should not be empty',
        'description should not be empty',
        'content should not be empty'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails if system does not exist', async (): Promise<void> => {
    const authService = app.get(AuthService);
  
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
  
    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);
  
    const { _id } = userRepositoryMock.entities[0];
  
    const token = await authService.generateToken(_id);

    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      type: SymbolType.Constant,
      content: '\\alpha'
    });

    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body).toEqual({
      error: 'Not Found',
      message: 'Symbols cannot be added to formal systems that do not exist.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails if user did not create the system', async (): Promise<void> => {
    const authService = app.get(AuthService);
  
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
  
    expect(userRepositoryMock.entities.length).toBeGreaterThan(1);
  
    const { _id: userId } = userRepositoryMock.entities[1];
  
    const token = await authService.generateToken(userId);

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    expect(systemRepositoryMock.entities.length).toBeGreaterThan(0);

    const { _id } = systemRepositoryMock.entities[0];

    const response = await request(app.getHttpServer()).post(`/system/${_id}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      type: SymbolType.Constant,
      content: '\\alpha'
    });

    expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    expect(response.body).toEqual({
      error: 'Forbidden',
      message: 'Symbols cannot be added to formal systems unless you created them.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('succeeds if content is unique in the formal system', async (): Promise<void> => {
    const authService = app.get(AuthService);
  
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
  
    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);
  
    const { _id: userId } = userRepositoryMock.entities[0];
  
    const token = await authService.generateToken(userId);

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    expect(systemRepositoryMock.entities.length).toBeGreaterThan(0);

    const { _id } = systemRepositoryMock.entities[0];

    const response = await request(app.getHttpServer()).post(`/system/${_id}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      type: SymbolType.Constant,
      content: '\\alpha'
    });

    expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(response.body).toEqual({});
  });

  it('fails if content is not unique in the formal system', async (): Promise<void> => {
    const authService = app.get(AuthService);
  
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
  
    expect(userRepositoryMock.entities.length).toBeGreaterThan(0);
  
    const { _id: userId } = userRepositoryMock.entities[0];
  
    const token = await authService.generateToken(userId);

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    expect(systemRepositoryMock.entities.length).toBeGreaterThan(0);

    const { _id } = systemRepositoryMock.entities[0];

    const response = await request(app.getHttpServer()).post(`/system/${_id}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      type: SymbolType.Constant,
      content: '\\alpha'
    });

    expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(response.body).toEqual({});

    const collision = await request(app.getHttpServer()).post(`/system/${_id}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      type: SymbolType.Constant,
      content: '\\alpha'
    });

    expect(collision.statusCode).toBe(HttpStatus.CONFLICT);
    expect(collision.body).toEqual({
      error: 'Conflict',
      message: 'Symbols within a formal system must have unique content.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  afterEach((): void => {
    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    symbolRepositoryMock.entities = [];
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
