import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SymbolRepositoryMock } from './mocks/symbol-repository.mock';

describe('Delete Symbol', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'delete', '/system/1/symbol/1');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'delete', '/system/1/symbol/1');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'delete', '/system/1/symbol/1');
  });

  it('fails with an invalid route parameter', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete('/system/1/symbol/1').set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'symbolId should be a mongodb id',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with an invalid route parameter', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/1/symbol/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'systemId should be a mongodb id',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('succeeds if the symbol does not exist', async (): Promise<void> => {
    const symbolId = new ObjectId();

    const user = new UserEntity();

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${new ObjectId()}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: symbolId.toString()
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

    const response = await request(app.getHttpServer()).delete(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'You cannot delete a symbol unless you created it.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails if the symbol is used in any axioms', async (): Promise<void> => {
    const symbol = new SymbolEntity();
    const user = new UserEntity();

    symbol.axiomAppearances = 1;
    symbol.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(symbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Symbols in use cannot be deleted.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('fails if the symbol is used in any theorems', async (): Promise<void> => {
    const symbol = new SymbolEntity();
    const user = new UserEntity();

    symbol.theoremAppearances = 1;
    symbol.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(symbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Symbols in use cannot be deleted.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('fails if the symbol is used in any deductions', async (): Promise<void> => {
    const symbol = new SymbolEntity();
    const user = new UserEntity();

    symbol.deductionAppearances = 1;
    symbol.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(symbol);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Symbols in use cannot be deleted.',
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
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).delete(`/system/${symbol.systemId}/symbol/${symbol._id}`).set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: symbol._id.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
