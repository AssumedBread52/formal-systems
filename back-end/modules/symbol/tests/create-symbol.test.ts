import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SystemEntity } from '@/system/system.entity';
import { SystemRepositoryMock } from '@/system/tests/mocks/system-repository.mock';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SymbolRepositoryMock } from './mocks/symbol-repository.mock';

describe('Create Symbol', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
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
    const token = await app.get(AuthService).generateToken(new ObjectId());

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/symbol`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
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
    const token = await app.get(AuthService).generateToken(new ObjectId());

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(new UserEntity());

    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      type: SymbolType.Constant,
      content: '\\alpha'
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'Symbols cannot be added to formal systems that do not exist.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails if user did not create the system', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();

    const { _id, createdByUserId } = testSystem;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(testSystem);

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const response = await request(app.getHttpServer()).post(`/system/${_id}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      type: SymbolType.Constant,
      content: '\\alpha'
    });

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'Symbols cannot be added to formal systems unless you created them.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails if content is not unique in the formal system', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();

    const { _id, createdByUserId } = testSystem;

    testUser._id = createdByUserId;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(testSystem);
    symbolRepositoryMock.findOneBy.mockReturnValueOnce(new SymbolEntity());

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const response = await request(app.getHttpServer()).post(`/system/${_id}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      type: SymbolType.Constant,
      content: '\\alpha'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Symbols within a formal system must have unique content.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();

    const { _id, createdByUserId } = testSystem;

    testUser._id = createdByUserId;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(testSystem);

    const token = await app.get(AuthService).generateToken(createdByUserId);

    const response = await request(app.getHttpServer()).post(`/system/${_id}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      type: SymbolType.Constant,
      content: '\\alpha'
    });

    expectCorrectResponse(response, HttpStatus.CREATED, {});
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
