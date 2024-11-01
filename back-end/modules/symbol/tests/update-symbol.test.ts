import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { TokenService } from '@/auth/services/token.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SymbolRepositoryMock } from './mocks/symbol-repository.mock';

describe('Update Symbol', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'patch', '/system/1/symbol/1');
    expect(1).toBe(2);
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'patch', '/system/1/symbol/1');
    expect(1).toBe(2);
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'patch', '/system/1/symbol/1');
    expect(1).toBe(2);
  });

  it('fails with an invalid symbol ID', async (): Promise<void> => {
    expect(1).toBe(2);
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

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
    expect(1).toBe(2);
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

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
    expect(1).toBe(2);
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

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
    expect(1).toBe(2);
    const user = new UserEntity();

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

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
    expect(1).toBe(2);
    const symbol = new SymbolEntity();
    const user = new UserEntity();

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(symbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

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
    const symbolId = new ObjectId();
    const newTitle = 'New Symbol Title';
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const symbol = new SymbolEntity();
    const conflictSymbol = new SymbolEntity();

    user._id = createdByUserId;
    symbol._id = symbolId;
    symbol.axiomAppearances = 1;
    symbol.theoremAppearances = 1;
    symbol.deductionAppearances = 1;
    symbol.systemId = systemId;
    symbol.createdByUserId = createdByUserId;
    conflictSymbol.title = newTitle;
    conflictSymbol.systemId = systemId;
    conflictSymbol.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);
    findOneBy.mockResolvedValueOnce(conflictSymbol);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newType: SymbolType.Variable,
      newContent: '\\alpha'
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: symbolId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      title: newTitle,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.CONFLICT);
    expect(body).toEqual({
      error: 'Conflict',
      message: 'Symbols in the same system must have a unique title.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('fails if changing the type and the symbol is used by any axiom', async (): Promise<void> => {
    const symbolId = new ObjectId();
    const newTitle = 'New Symbol Title';
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const symbol = new SymbolEntity();

    user._id = createdByUserId;
    symbol._id = symbolId;
    symbol.axiomAppearances = 1;
    symbol.theoremAppearances = 1;
    symbol.deductionAppearances = 1;
    symbol.systemId = systemId;
    symbol.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newType: SymbolType.Variable,
      newContent: '\\alpha'
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: symbolId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      title: newTitle,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Symbols in use cannot under go write actions.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if changing the type and the symbol is used by any theorem', async (): Promise<void> => {
    const symbolId = new ObjectId();
    const newTitle = 'New Symbol Title';
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const symbol = new SymbolEntity();

    user._id = createdByUserId;
    symbol._id = symbolId;
    symbol.axiomAppearances = 0;
    symbol.theoremAppearances = 1;
    symbol.deductionAppearances = 1;
    symbol.systemId = systemId;
    symbol.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newType: SymbolType.Variable,
      newContent: '\\alpha'
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: symbolId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      title: newTitle,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Symbols in use cannot under go write actions.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if changing the type and the symbol is used by any deduction', async (): Promise<void> => {
    const symbolId = new ObjectId();
    const newTitle = 'New Symbol Title';
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const symbol = new SymbolEntity();

    user._id = createdByUserId;
    symbol._id = symbolId;
    symbol.axiomAppearances = 0;
    symbol.theoremAppearances = 0;
    symbol.deductionAppearances = 1;
    symbol.systemId = systemId;
    symbol.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newType: SymbolType.Variable,
      newContent: '\\alpha'
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: symbolId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      title: newTitle,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Symbols in use cannot under go write actions.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('succeeds', async (): Promise<void> => {
    const symbolId = new ObjectId();
    const newTitle = 'New Symbol Title';
    const newDescription = 'This is a new test.';
    const newType = SymbolType.Variable;
    const newContent = '\\alpha';
    const axiomAppearances = 0;
    const theoremAppearances = 0;
    const deductionAppearances = 0;
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const symbol = new SymbolEntity();
    const updatedSymbol = new SymbolEntity();

    user._id = createdByUserId;
    symbol._id = symbolId;
    symbol.axiomAppearances = axiomAppearances;
    symbol.theoremAppearances = theoremAppearances;
    symbol.deductionAppearances = deductionAppearances;
    symbol.systemId = systemId;
    symbol.createdByUserId = createdByUserId;
    updatedSymbol._id = symbolId;
    updatedSymbol.title = newTitle;
    updatedSymbol.description = newDescription;
    updatedSymbol.type = newType;
    updatedSymbol.content = newContent;
    updatedSymbol.axiomAppearances = axiomAppearances;
    updatedSymbol.theoremAppearances = theoremAppearances;
    updatedSymbol.deductionAppearances = deductionAppearances;
    updatedSymbol.systemId = systemId;
    updatedSymbol.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);
    findOneBy.mockResolvedValueOnce(null);
    save.mockResolvedValueOnce(updatedSymbol);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription,
      newType,
      newContent
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: symbolId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      title: newTitle,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, updatedSymbol);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
      id: symbolId.toString(),
      title: newTitle,
      description: newDescription,
      type: newType,
      content: newContent,
      axiomAppearances,
      theoremAppearances,
      deductionAppearances,
      systemId: systemId.toString(),
      createdByUserId: createdByUserId.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
