import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SymbolRepositoryMock } from './mocks/symbol-repository.mock';

describe('Update Symbol', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'patch', '/system/1/symbol/1');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'patch', '/system/1/symbol/1');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'patch', '/system/1/symbol/1');
  });

  it('fails with an invalid symbol ID', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch('/system/1/symbol/1').set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Invalid Mongodb ID structure.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with an invalid system ID', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/1/symbol/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Invalid Mongodb ID structure.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/symbol/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newType: 'invalid'
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'newTitle should not be empty',
        'newDescription should not be empty',
        'newType must be one of the following values: Constant, Variable',
        'newContent should not be empty'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails if the symbol does not exist', async (): Promise<void> => {
    const user = new UserEntity();

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/symbol/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test',
      newDescription: 'This is a new test.',
      newType: SymbolType.Variable,
      newContent: '\\alpha'
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'Symbol not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails if the user did not create the symbol', async (): Promise<void> => {
    const symbol = new SymbolEntity();
    const user = new UserEntity();

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(symbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test',
      newDescription: 'This is a new test.',
      newType: SymbolType.Variable,
      newContent: '\\alpha'
    });

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'Write actions require user ownership.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails if the title is already in use within the system', async (): Promise<void> => {
    const newTitle = 'New Test';

    const conflictSymbol = new SymbolEntity();
    const symbol = new SymbolEntity();
    const user = new UserEntity();

    conflictSymbol.title = newTitle;
    conflictSymbol.createdByUserId = user._id;
    symbol.systemId = conflictSymbol.systemId;
    symbol.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(symbol);
    symbolRepositoryMock.findOneBy.mockReturnValueOnce(conflictSymbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newType: SymbolType.Variable,
      newContent: '\\alpha'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Symbols within a formal system must have a unique title.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('fails if changing the type and the symbol is used by any axiom', async (): Promise<void> => {
    const symbol = new SymbolEntity();
    const user = new UserEntity();

    symbol.axiomAppearances = 1;
    symbol.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(symbol);
    symbolRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test',
      newDescription: 'This is a new test.',
      newType: SymbolType.Variable,
      newContent: '\\alpha'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Symbols in use cannot change their type.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('fails if changing the type and the symbol is used by any theorem', async (): Promise<void> => {
    const symbol = new SymbolEntity();
    const user = new UserEntity();

    symbol.theoremAppearances = 1;
    symbol.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(symbol);
    symbolRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test',
      newDescription: 'This is a new test.',
      newType: SymbolType.Variable,
      newContent: '\\alpha'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Symbols in use cannot change their type.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('fails if changing the type and the symbol is used by any deduction', async (): Promise<void> => {
    const symbol = new SymbolEntity();
    const user = new UserEntity();

    symbol.deductionAppearances = 1;
    symbol.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(symbol);
    symbolRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test',
      newDescription: 'This is a new test.',
      newType: SymbolType.Variable,
      newContent: '\\alpha'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Symbols in use cannot change their type.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds', async (): Promise<void> => {
    const symbol = new SymbolEntity();
    const user = new UserEntity();

    symbol.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(symbol);
    symbolRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test',
      newDescription: 'This is a new test.',
      newType: SymbolType.Variable,
      newContent: '\\alpha'
    });

    expectCorrectResponse(response, HttpStatus.OK, {
      id: symbol._id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
