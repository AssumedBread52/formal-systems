import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { TokenService } from '@/auth/services/token.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { removeMock } from '@/common/tests/mocks/remove.mock';
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

describe('Delete Symbol', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const remove = removeMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    expect(1).toBe(2);
    await testMissingToken(app, 'delete', '/system/1/symbol/1');
  });

  it('fails with an expired token', async (): Promise<void> => {
    expect(1).toBe(2);
    await testExpiredToken(app, 'delete', '/system/1/symbol/1');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    expect(1).toBe(2);
    await testInvalidToken(app, 'delete', '/system/1/symbol/1');
  });

  it('fails with an invalid route parameter', async (): Promise<void> => {
    expect(1).toBe(2);
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete('/system/1/symbol/1').set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Invalid Mongodb ID structure.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with an invalid route parameter', async (): Promise<void> => {
    expect(1).toBe(2);
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/1/symbol/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Invalid Mongodb ID structure.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('succeeds if the symbol does not exist', async (): Promise<void> => {
    expect(1).toBe(2);
    const symbolId = new ObjectId();

    const user = new UserEntity();

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${new ObjectId()}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: symbolId.toString()
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

    const response = await request(app.getHttpServer()).delete(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'Write actions require user ownership.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails if the symbol is used in any axioms', async (): Promise<void> => {
    expect(1).toBe(2);
    const symbol = new SymbolEntity();
    const user = new UserEntity();

    symbol.axiomAppearances = 1;
    symbol.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(symbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Symbols in use cannot under go write actions.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the symbol is used in any theorems', async (): Promise<void> => {
    expect(1).toBe(2);
    const symbol = new SymbolEntity();
    const user = new UserEntity();

    symbol.theoremAppearances = 1;
    symbol.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(symbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Symbols in use cannot under go write actions.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the symbol is used in any deductions', async (): Promise<void> => {
    expect(1).toBe(2);
    const symbol = new SymbolEntity();
    const user = new UserEntity();

    symbol.deductionAppearances = 1;
    symbol.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(symbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Symbols in use cannot under go write actions.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('succeeds', async (): Promise<void> => {
    const symbolId = new ObjectId();
    const title = 'Test Symbol';
    const description = 'This is a test.';
    const type = SymbolType.Variable;
    const content = '\\alpha';
    const axiomAppearances = 0;
    const theoremAppearances = 0;
    const deductionAppearances = 0;
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const symbol = new SymbolEntity();

    user._id = createdByUserId;
    symbol._id = symbolId;
    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.axiomAppearances = axiomAppearances;
    symbol.theoremAppearances = theoremAppearances;
    symbol.deductionAppearances = deductionAppearances;
    symbol.systemId = systemId;
    symbol.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);
    remove.mockResolvedValueOnce(symbol);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: symbolId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenNthCalledWith(1, symbol);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
      id: symbolId.toString(),
      title,
      description,
      type,
      content,
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
