import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { generateToken } from '@/auth/tests/helpers/generate-token';
import { testWithExpiredToken } from '@/auth/tests/helpers/test-with-expired-token';
import { testWithInvalidToken } from '@/auth/tests/helpers/test-with-invalid-token';
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

    const token = await generateToken(app);

    await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.'
    });

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    const { _id } = systemRepositoryMock.systems[0];

    await request(app.getHttpServer()).post(`/system/${_id}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      type: SymbolType.Constant,
      content: '\\alpha'
    });

    await request(app.getHttpServer()).post(`/system/${_id}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      type: SymbolType.Constant,
      content: '\\beta'
    });
  });

  it('fails without a token', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/symbol/${new ObjectId()}`);
  
    expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body).toEqual({
      message: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testWithInvalidToken(app, 'patch', `/system/${new ObjectId()}/symbol/${new ObjectId()}`);
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testWithExpiredToken(app, 'patch', `/system/${new ObjectId()}/symbol/${new ObjectId()}`);
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const token = await generateToken(app);

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/symbol/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]);

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: [
        'newTitle should not be empty',
        'newDescription should not be empty',
        'newContent should not be empty'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails if symbol does not exist', async (): Promise<void> => {
    const token = await generateToken(app);

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/symbol/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newType: SymbolType.Constant,
      newContent: '\\alpha'
    });

    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.body).toEqual({
      error: 'Not Found',
      message: 'Symbol not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails if user did not create the symbol', async (): Promise<void> => {
    const token = await generateToken(app, 1);

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    expect(symbolRepositoryMock.symbols.length).toBeGreaterThan(0);

    const { _id } = symbolRepositoryMock.symbols[0];

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/symbol/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newType: SymbolType.Constant,
      newContent: '\\beta'
    });

    expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    expect(response.body).toEqual({
      error: 'Forbidden',
      message: 'You cannot update this entity.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails if another symbol already has the new content', async (): Promise<void> => {
    const token = await generateToken(app);

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    expect(symbolRepositoryMock.symbols.length).toBeGreaterThan(0);

    const { _id } = symbolRepositoryMock.symbols[0];

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/symbol/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newType: SymbolType.Constant,
      newContent: '\\beta'
    });

    expect(response.statusCode).toBe(HttpStatus.CONFLICT);
    expect(response.body).toEqual({
      error: 'Conflict',
      message: 'Symbols within a formal system must have unique content.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds if the new content is new to the system', async (): Promise<void> => {
    const token = await generateToken(app);

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    expect(symbolRepositoryMock.symbols.length).toBeGreaterThan(0);

    const { _id } = symbolRepositoryMock.symbols[0];

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/symbol/${_id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'Test',
      newDescription: 'This is a test.',
      newType: SymbolType.Constant,
      newContent: '\\gamma'
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
