import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { removeMock } from '@/common/tests/mocks/remove.mock';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Delete Symbol', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const remove = removeMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).delete('/system/1/symbol/1');

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(0);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body).toEqual({
      message: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with an expired token', async (): Promise<void> => {
    const token = app.get(JwtService).sign({});

    await new Promise((resolve: (value: unknown) => void): void => {
      setTimeout(resolve, 1000);
    });

    const response = await request(app.getHttpServer()).delete('/system/1/symbol/1').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(0);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body).toEqual({
      message: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with an invalid token', async (): Promise<void> => {
    const token = app.get(JwtService).sign({});

    const response = await request(app.getHttpServer()).delete('/system/1/symbol/1').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(0);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body).toEqual({
      error: 'Unauthorized',
      message: 'Invalid token.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails if the user ID in the token payload does not match a user', async (): Promise<void> => {
    const userId = new ObjectId();

    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).delete('/system/1/symbol/1').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body).toEqual({
      error: 'Unauthorized',
      message: 'Invalid token.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with an invalid symbol ID', async (): Promise<void> => {
    const userId = new ObjectId();
    const user = new UserEntity();

    user._id = userId;

    findOneBy.mockResolvedValueOnce(user);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).delete('/system/1/symbol/1').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Invalid Object ID.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with an invalid system ID', async (): Promise<void> => {
    const userId = new ObjectId();
    const user = new UserEntity();

    user._id = userId;

    findOneBy.mockResolvedValueOnce(user);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).delete(`/system/1/symbol/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Invalid Object ID.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the symbol does not exist', async (): Promise<void> => {
    const symbolId = new ObjectId();
    const systemId = new ObjectId();
    const userId = new ObjectId();
    const user = new UserEntity();

    user._id = userId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: symbolId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(body).toEqual({
      error: 'Not Found',
      message: 'Symbol not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails if the user did not create the symbol', async (): Promise<void> => {
    const symbolId = new ObjectId();
    const systemId = new ObjectId();
    const userId = new ObjectId();
    const user = new UserEntity();
    const symbol = new SymbolEntity();

    user._id = userId;
    symbol._id = symbolId;
    symbol.systemId = systemId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: symbolId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.FORBIDDEN);
    expect(body).toEqual({
      error: 'Forbidden',
      message: 'Write actions require user ownership.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails if the symbol is used in any axioms', async (): Promise<void> => {
    const symbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const symbol = new SymbolEntity();

    user._id = createdByUserId;
    symbol._id = symbolId;
    symbol.axiomAppearanceCount = 1;
    symbol.systemId = systemId;
    symbol.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);

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
    expect(remove).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Symbols in use cannot under go write actions.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the symbol is used in any theorems', async (): Promise<void> => {
    const symbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const symbol = new SymbolEntity();

    user._id = createdByUserId;
    symbol._id = symbolId;
    symbol.theoremAppearanceCount = 1;
    symbol.systemId = systemId;
    symbol.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);

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
    expect(remove).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Symbols in use cannot under go write actions.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the symbol is used in any deductions', async (): Promise<void> => {
    const symbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const symbol = new SymbolEntity();

    user._id = createdByUserId;
    symbol._id = symbolId;
    symbol.deductionAppearanceCount = 1;
    symbol.systemId = systemId;
    symbol.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);

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
    expect(remove).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
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
    const axiomAppearanceCount = 0;
    const theoremAppearanceCount = 0;
    const deductionAppearanceCount = 0;
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
    symbol.axiomAppearanceCount = axiomAppearanceCount;
    symbol.theoremAppearanceCount = theoremAppearanceCount;
    symbol.deductionAppearanceCount = deductionAppearanceCount;
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
      axiomAppearanceCount,
      theoremAppearanceCount,
      deductionAppearanceCount,
      systemId: systemId.toString(),
      createdByUserId: createdByUserId.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
