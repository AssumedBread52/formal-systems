import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SystemEntity } from '@/system/system.entity';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Create Symbol', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/system/1/symbol');

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(0);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
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

    const response = await request(app.getHttpServer()).post('/system/1/symbol').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(0);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body).toEqual({
      message: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with an invalid token', async (): Promise<void> => {
    const token = app.get(JwtService).sign({});

    const response = await request(app.getHttpServer()).post('/system/1/symbol').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(0);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
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

    const response = await request(app.getHttpServer()).post('/system/1/symbol').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body).toEqual({
      error: 'Unauthorized',
      message: 'Invalid token.',
      statusCode: HttpStatus.UNAUTHORIZED
    });
  });

  it('fails with an invalid route parameter', async (): Promise<void> => {
    const userId = new ObjectId();
    const user = new UserEntity();

    user._id = userId;

    findOneBy.mockResolvedValueOnce(user);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).post('/system/1/symbol').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Invalid Object ID.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the system does not exist', async (): Promise<void> => {
    const systemId = new ObjectId();
    const userId = new ObjectId();
    const user = new UserEntity();

    user._id = userId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/symbol`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(body).toEqual({
      error: 'Not Found',
      message: 'System not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails if the user did not create the system', async (): Promise<void> => {
    const systemId = new ObjectId();
    const userId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();

    user._id = userId;
    system._id = systemId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/symbol`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.FORBIDDEN);
    expect(body).toEqual({
      error: 'Forbidden',
      message: 'Write actions require user ownership.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      type: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'title should not be empty',
        'description should not be empty',
        'type must be one of the following values: Constant, Variable',
        'content should not be empty'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails if the title is not unique in the system', async (): Promise<void> => {
    const title = 'Test Symbol';
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();
    const conflictSymbol = new SymbolEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.createdByUserId = createdByUserId;
    conflictSymbol.title = title;
    conflictSymbol.systemId = systemId;
    conflictSymbol.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(conflictSymbol);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description: 'This is a test.',
      type: SymbolType.Variable,
      content: '\\alpha'
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      title,
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

  it('succeeds', async (): Promise<void> => {
    const symbolId = new ObjectId();
    const title = 'Test Symbol';
    const description = 'This is a test.';
    const type = SymbolType.Variable;
    const content = '\\alpha';
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();
    const symbol = new SymbolEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.createdByUserId = createdByUserId;
    symbol._id = symbolId;
    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.systemId = systemId;
    symbol.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(null);
    save.mockResolvedValueOnce(symbol);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description,
      type,
      content
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      title,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      _id: expect.objectContaining(/[0-9a-f]{24}/),
      title,
      description,
      type,
      content,
      axiomAppearances: 0,
      deductionAppearances: 0,
      theoremAppearances: 0,
      systemId,
      createdByUserId
    });
    expect(statusCode).toBe(HttpStatus.CREATED);
    expect(body).toEqual({
      id: symbolId.toString(),
      title,
      description,
      type,
      content,
      axiomAppearances: 0,
      deductionAppearances: 0,
      theoremAppearances: 0,
      systemId: systemId.toString(),
      createdByUserId: createdByUserId.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
