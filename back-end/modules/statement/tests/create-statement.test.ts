import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { findByMock } from '@/common/tests/mocks/find-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { StatementEntity } from '@/statement/statement.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SystemEntity } from '@/system/system.entity';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Create Statement', (): void => {
  const findBy = findByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/statement`);

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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

    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/statement`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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

    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/statement`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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

    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/statement`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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

  it('fails with an invalid system ID', async (): Promise<void> => {
    const userId = new ObjectId();
    const user = new UserEntity();

    user._id = userId;

    findOneBy.mockResolvedValueOnce(user);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).post('/system/1/statement').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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

  it('fails if the system is not found', async (): Promise<void> => {
    const systemId = new ObjectId();
    const userId = new ObjectId();
    const user = new UserEntity();

    user._id = userId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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

  it('fails with in an invalid title and description', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      distinctVariableRestrictions: 'invalid',
      variableTypeHypotheses: 'invalid',
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids',
        'distinctVariableRestrictions must be an array',
        'All distinctVariableRestrictions\'s elements must be unique',
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'variableTypeHypotheses must be an array',
        'All variableTypeHypotheses\'s elements must be unique',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid distinct variable restriction', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: 'invalid',
      variableTypeHypotheses: 'invalid',
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids',
        'distinctVariableRestrictions must be an array',
        'All distinctVariableRestrictions\'s elements must be unique',
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'variableTypeHypotheses must be an array',
        'All variableTypeHypotheses\'s elements must be unique',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid distinct variable restriction', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        'invalid',
        'invalid'
      ],
      variableTypeHypotheses: 'invalid',
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids',
        'All distinctVariableRestrictions\'s elements must be unique',
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'variableTypeHypotheses must be an array',
        'All variableTypeHypotheses\'s elements must be unique',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid distinct variable restriction', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        ['invalid', 'invalid', 'invalid']
      ],
      variableTypeHypotheses: 'invalid',
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids',
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'variableTypeHypotheses must be an array',
        'All variableTypeHypotheses\'s elements must be unique',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid distinct variable restriction', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        ['invalid']
      ],
      variableTypeHypotheses: 'invalid',
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids',
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'variableTypeHypotheses must be an array',
        'All variableTypeHypotheses\'s elements must be unique',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid distinct variable restriction', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        ['invalid', 'invalid']
      ],
      variableTypeHypotheses: 'invalid',
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids',
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'variableTypeHypotheses must be an array',
        'All variableTypeHypotheses\'s elements must be unique',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid distinct variable restriction', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [new ObjectId(), 'invalid']
      ],
      variableTypeHypotheses: 'invalid',
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids',
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'variableTypeHypotheses must be an array',
        'All variableTypeHypotheses\'s elements must be unique',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid distinct variable restriction', async (): Promise<void> => {
    const symbolId = new ObjectId();
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [symbolId, symbolId]
      ],
      variableTypeHypotheses: 'invalid',
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids',
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'variableTypeHypotheses must be an array',
        'All variableTypeHypotheses\'s elements must be unique',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid variable type hypothesis', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      variableTypeHypotheses: 'invalid',
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'variableTypeHypotheses must be an array',
        'All variableTypeHypotheses\'s elements must be unique',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid variable type hypothesis', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      variableTypeHypotheses: [
        'invalid',
        'invalid'
      ],
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'All variableTypeHypotheses\'s elements must be unique',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid variable type hypothesis', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      variableTypeHypotheses: [
        ['invalid', 'invalid', 'invalid']
      ],
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid variable type hypothesis', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      variableTypeHypotheses: [
        ['invalid']
      ],
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid variable type hypothesis', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      variableTypeHypotheses: [
        ['invalid', 'invalid']
      ],
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid variable type hypothesis', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      variableTypeHypotheses: [
        [new ObjectId(), 'invalid']
      ],
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid variable type hypothesis', async (): Promise<void> => {
    const symbolId = new ObjectId();
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      variableTypeHypotheses: [
        [symbolId, symbolId]
      ],
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid logical hypothesis', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      variableTypeHypotheses: [
        [new ObjectId(), new ObjectId()]
      ],
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in each value in logicalHypotheses must be a mongodb id',
        'logicalHypotheses must be an array',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid logical hypothesis', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      variableTypeHypotheses: [
        [new ObjectId(), new ObjectId()]
      ],
      logicalHypotheses: [
        'invalid',
        'invalid'
      ],
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in each value in logicalHypotheses must be a mongodb id',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid logical hypothesis', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      variableTypeHypotheses: [
        [new ObjectId(), new ObjectId()]
      ],
      logicalHypotheses: [
        ['invalid'],
        ['invalid']
      ],
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in each value in logicalHypotheses must be a mongodb id',
        'All logicalHypotheses\'s elements must be unique',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid assertion', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      variableTypeHypotheses: [
        [new ObjectId(), new ObjectId()]
      ],
      logicalHypotheses: [
        [new ObjectId()]
      ],
      assertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with in an invalid assertion', async (): Promise<void> => {
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

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test Statement',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      variableTypeHypotheses: [
        [new ObjectId(), new ObjectId()]
      ],
      logicalHypotheses: [
        [new ObjectId()]
      ],
      assertion: [
        'invalid'
      ]
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
        'each value in assertion must be a mongodb id'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails if the title is not unique in the system', async (): Promise<void> => {
    const title = 'Test Statement';
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();
    const conflictStatement = new StatementEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.createdByUserId = createdByUserId;
    conflictStatement.title = title;
    conflictStatement.systemId = systemId;
    conflictStatement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(conflictStatement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      variableTypeHypotheses: [
        [new ObjectId(), new ObjectId()]
      ],
      logicalHypotheses: [
        [new ObjectId()]
      ],
      assertion: [
        new ObjectId()
      ]
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(0);
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
      message: 'Statements in the same system must have a unique title.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('fails if not all symbols exist in the system', async (): Promise<void> => {
    const title = 'Test Statement';
    const turnstileSymbolId = new ObjectId();
    const wffSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.createdByUserId = createdByUserId;

    findBy.mockResolvedValueOnce([]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [wffSymbolId, turnstileSymbolId]
      ],
      variableTypeHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      logicalHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      assertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(1);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      _id: {
        $in: [aSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, wffSymbolId, turnstileSymbolId]
      },
      systemId
    });
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
    expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(body).toEqual({
      error: 'Not Found',
      message: 'Symbol not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails if distinct variable restriction ends with a constant symbol', async (): Promise<void> => {
    const title = 'Test Statement';
    const turnstileSymbolId = new ObjectId();
    const wffSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();
    const turnstileSymbol = new SymbolEntity();
    const wffSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.createdByUserId = createdByUserId;
    turnstileSymbol._id = turnstileSymbolId;
    turnstileSymbol.systemId = systemId;
    turnstileSymbol.createdByUserId = createdByUserId;
    wffSymbol._id = wffSymbolId;
    wffSymbol.systemId = systemId;
    wffSymbol.createdByUserId = createdByUserId;
    alphaSymbol._id = alphaSymbolId;
    alphaSymbol.type = SymbolType.Variable;
    alphaSymbol.systemId = systemId;
    alphaSymbol.createdByUserId = createdByUserId;
    aSymbol._id = aSymbolId;
    aSymbol.type = SymbolType.Variable;
    aSymbol.systemId = systemId;
    aSymbol.createdByUserId = createdByUserId;

    findBy.mockResolvedValueOnce([
      turnstileSymbol,
      wffSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [wffSymbolId, turnstileSymbolId]
      ],
      variableTypeHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      logicalHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      assertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(1);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      _id: {
        $in: [aSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, wffSymbolId, turnstileSymbolId]
      },
      systemId
    });
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
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Invalid symbol type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if distinct variable restriction ends with a constant symbol', async (): Promise<void> => {
    const title = 'Test Statement';
    const turnstileSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();
    const turnstileSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.createdByUserId = createdByUserId;
    turnstileSymbol._id = turnstileSymbolId;
    turnstileSymbol.systemId = systemId;
    turnstileSymbol.createdByUserId = createdByUserId;
    alphaSymbol._id = alphaSymbolId;
    alphaSymbol.type = SymbolType.Variable;
    alphaSymbol.systemId = systemId;
    alphaSymbol.createdByUserId = createdByUserId;
    aSymbol._id = aSymbolId;
    aSymbol.type = SymbolType.Variable;
    aSymbol.systemId = systemId;
    aSymbol.createdByUserId = createdByUserId;

    findBy.mockResolvedValueOnce([
      turnstileSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      variableTypeHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      logicalHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      assertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(1);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      _id: {
        $in: [aSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId]
      },
      systemId
    });
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
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Invalid symbol type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if type hypothesis uses a variable as a type', async (): Promise<void> => {
    const title = 'Test Statement';
    const turnstileSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();
    const turnstileSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.createdByUserId = createdByUserId;
    turnstileSymbol._id = turnstileSymbolId;
    turnstileSymbol.systemId = systemId;
    turnstileSymbol.createdByUserId = createdByUserId;
    alphaSymbol._id = alphaSymbolId;
    alphaSymbol.type = SymbolType.Variable;
    alphaSymbol.systemId = systemId;
    alphaSymbol.createdByUserId = createdByUserId;
    aSymbol._id = aSymbolId;
    aSymbol.type = SymbolType.Variable;
    aSymbol.systemId = systemId;
    aSymbol.createdByUserId = createdByUserId;

    findBy.mockResolvedValueOnce([
      turnstileSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [alphaSymbolId, aSymbolId]
      ],
      variableTypeHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      logicalHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      assertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(1);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      _id: {
        $in: [aSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, aSymbolId]
      },
      systemId
    });
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
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Invalid symbol type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if type hypothesis types a constant symbol', async (): Promise<void> => {
    const title = 'Test Statement';
    const turnstileSymbolId = new ObjectId();
    const wffSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();
    const turnstileSymbol = new SymbolEntity();
    const wffSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.createdByUserId = createdByUserId;
    turnstileSymbol._id = turnstileSymbolId;
    turnstileSymbol.systemId = systemId;
    turnstileSymbol.createdByUserId = createdByUserId;
    wffSymbol._id = wffSymbolId;
    wffSymbol.systemId = systemId;
    wffSymbol.createdByUserId = createdByUserId;
    alphaSymbol._id = alphaSymbolId;
    alphaSymbol.type = SymbolType.Variable;
    alphaSymbol.systemId = systemId;
    alphaSymbol.createdByUserId = createdByUserId;
    aSymbol._id = aSymbolId;
    aSymbol.type = SymbolType.Variable;
    aSymbol.systemId = systemId;
    aSymbol.createdByUserId = createdByUserId;

    findBy.mockResolvedValueOnce([
      turnstileSymbol,
      wffSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [alphaSymbolId, aSymbolId]
      ],
      variableTypeHypotheses: [
        [wffSymbolId, turnstileSymbolId]
      ],
      logicalHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      assertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(1);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      _id: {
        $in: [aSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, wffSymbolId, turnstileSymbolId, alphaSymbolId, aSymbolId]
      },
      systemId
    });
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
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Invalid symbol type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with an invalid symbol prefix in a logical hypothesis', async (): Promise<void> => {
    const title = 'Test Statement';
    const turnstileSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();
    const turnstileSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.createdByUserId = createdByUserId;
    turnstileSymbol._id = turnstileSymbolId;
    turnstileSymbol.systemId = systemId;
    turnstileSymbol.createdByUserId = createdByUserId;
    alphaSymbol._id = alphaSymbolId;
    alphaSymbol.type = SymbolType.Variable;
    alphaSymbol.systemId = systemId;
    alphaSymbol.createdByUserId = createdByUserId;
    aSymbol._id = aSymbolId;
    aSymbol.type = SymbolType.Variable;
    aSymbol.systemId = systemId;
    aSymbol.createdByUserId = createdByUserId;

    findBy.mockResolvedValueOnce([
      turnstileSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [alphaSymbolId, aSymbolId]
      ],
      variableTypeHypotheses: [],
      logicalHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      assertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(1);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      _id: {
        $in: [aSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, aSymbolId]
      },
      systemId
    });
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
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Invalid symbol type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with a missing variable type hypothesis in a logical hypothesis', async (): Promise<void> => {
    const title = 'Test Statement';
    const turnstileSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();
    const turnstileSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.createdByUserId = createdByUserId;
    turnstileSymbol._id = turnstileSymbolId;
    turnstileSymbol.systemId = systemId;
    turnstileSymbol.createdByUserId = createdByUserId;
    alphaSymbol._id = alphaSymbolId;
    alphaSymbol.type = SymbolType.Variable;
    alphaSymbol.systemId = systemId;
    alphaSymbol.createdByUserId = createdByUserId;
    aSymbol._id = aSymbolId;
    aSymbol.type = SymbolType.Variable;
    aSymbol.systemId = systemId;
    aSymbol.createdByUserId = createdByUserId;

    findBy.mockResolvedValueOnce([
      turnstileSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [alphaSymbolId, aSymbolId]
      ],
      variableTypeHypotheses: [],
      logicalHypotheses: [
        [turnstileSymbolId, alphaSymbolId, turnstileSymbolId]
      ],
      assertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(1);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      _id: {
        $in: [aSymbolId, turnstileSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, aSymbolId]
      },
      systemId
    });
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
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'All variable symbols in all logical hypotheses and the assertion must have a corresponding variable type hypothesis.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with an invalid symbol prefix in the assertion', async (): Promise<void> => {
    const title = 'Test Statement';
    const turnstileSymbolId = new ObjectId();
    const wffSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();
    const turnstileSymbol = new SymbolEntity();
    const wffSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.createdByUserId = createdByUserId;
    turnstileSymbol._id = turnstileSymbolId;
    turnstileSymbol.systemId = systemId;
    turnstileSymbol.createdByUserId = createdByUserId;
    wffSymbol._id = wffSymbolId;
    wffSymbol.systemId = systemId;
    wffSymbol.createdByUserId = createdByUserId;
    alphaSymbol._id = alphaSymbolId;
    alphaSymbol.type = SymbolType.Variable;
    alphaSymbol.systemId = systemId;
    alphaSymbol.createdByUserId = createdByUserId;
    aSymbol._id = aSymbolId;
    aSymbol.type = SymbolType.Variable;
    aSymbol.systemId = systemId;
    aSymbol.createdByUserId = createdByUserId;

    findBy.mockResolvedValueOnce([
      turnstileSymbol,
      wffSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [alphaSymbolId, aSymbolId]
      ],
      variableTypeHypotheses: [
        [wffSymbolId, alphaSymbolId]
      ],
      logicalHypotheses: [
        [turnstileSymbolId, alphaSymbolId, turnstileSymbolId]
      ],
      assertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(1);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      _id: {
        $in: [aSymbolId, turnstileSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, wffSymbolId, alphaSymbolId, alphaSymbolId, aSymbolId]
      },
      systemId
    });
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
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Invalid symbol type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with a missing variable type hypothesis in the assertion', async (): Promise<void> => {
    const title = 'Test Statement';
    const turnstileSymbolId = new ObjectId();
    const wffSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();
    const turnstileSymbol = new SymbolEntity();
    const wffSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.createdByUserId = createdByUserId;
    turnstileSymbol._id = turnstileSymbolId;
    turnstileSymbol.systemId = systemId;
    turnstileSymbol.createdByUserId = createdByUserId;
    wffSymbol._id = wffSymbolId;
    wffSymbol.systemId = systemId;
    wffSymbol.createdByUserId = createdByUserId;
    alphaSymbol._id = alphaSymbolId;
    alphaSymbol.type = SymbolType.Variable;
    alphaSymbol.systemId = systemId;
    alphaSymbol.createdByUserId = createdByUserId;
    aSymbol._id = aSymbolId;
    aSymbol.type = SymbolType.Variable;
    aSymbol.systemId = systemId;
    aSymbol.createdByUserId = createdByUserId;

    findBy.mockResolvedValueOnce([
      turnstileSymbol,
      wffSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [alphaSymbolId, aSymbolId]
      ],
      variableTypeHypotheses: [
        [wffSymbolId, alphaSymbolId]
      ],
      logicalHypotheses: [
        [turnstileSymbolId, alphaSymbolId, turnstileSymbolId]
      ],
      assertion: [
        turnstileSymbolId,
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(1);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      _id: {
        $in: [turnstileSymbolId, aSymbolId, turnstileSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, wffSymbolId, alphaSymbolId, alphaSymbolId, aSymbolId]
      },
      systemId
    });
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
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'All variable symbols in all logical hypotheses and the assertion must have a corresponding variable type hypothesis.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('succeeds', async (): Promise<void> => {
    const statementId = new ObjectId();
    const title = 'Test Statement';
    const description = 'This is a test.';
    const proofAppearanceCount = 0;
    const turnstileSymbolId = new ObjectId();
    const wffSymbolId = new ObjectId();
    const setvarSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const system = new SystemEntity();
    const turnstileSymbol = new SymbolEntity();
    const wffSymbol = new SymbolEntity();
    const setvarSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();
    const statement = new StatementEntity();
    const distinctVariableRestrictions = [
      [alphaSymbolId, aSymbolId]
    ] as [ObjectId, ObjectId][];
    const variableTypeHypotheses = [
      [wffSymbolId, alphaSymbolId],
      [setvarSymbolId, aSymbolId]
    ] as [ObjectId, ObjectId][];
    const logicalHypotheses = [
      [turnstileSymbolId, alphaSymbolId, turnstileSymbolId]
    ] as [ObjectId, ...ObjectId[]][];
    const assertion = [turnstileSymbolId, aSymbolId, turnstileSymbolId] as [ObjectId, ...ObjectId[]];

    user._id = createdByUserId;
    system._id = systemId;
    system.createdByUserId = createdByUserId;
    turnstileSymbol._id = turnstileSymbolId;
    turnstileSymbol.systemId = systemId;
    turnstileSymbol.createdByUserId = createdByUserId;
    wffSymbol._id = wffSymbolId;
    wffSymbol.systemId = systemId;
    wffSymbol.createdByUserId = createdByUserId;
    setvarSymbol._id = setvarSymbolId;
    setvarSymbol.systemId = systemId;
    setvarSymbol.createdByUserId = createdByUserId;
    alphaSymbol._id = alphaSymbolId;
    alphaSymbol.type = SymbolType.Variable;
    alphaSymbol.systemId = systemId;
    alphaSymbol.createdByUserId = createdByUserId;
    aSymbol._id = aSymbolId;
    aSymbol.type = SymbolType.Variable;
    aSymbol.systemId = systemId;
    aSymbol.createdByUserId = createdByUserId;
    statement._id = statementId;
    statement.title = title;
    statement.description = description;
    statement.distinctVariableRestrictions = distinctVariableRestrictions;
    statement.variableTypeHypotheses = variableTypeHypotheses;
    statement.logicalHypotheses = logicalHypotheses;
    statement.assertion = assertion;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findBy.mockResolvedValueOnce([
      turnstileSymbol,
      wffSymbol,
      setvarSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(null);
    save.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description,
      distinctVariableRestrictions,
      variableTypeHypotheses,
      logicalHypotheses,
      assertion
    });

    const { statusCode, body } = response;

    expect(findBy).toHaveBeenCalledTimes(1);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      _id: {
        $in: [turnstileSymbolId, aSymbolId, turnstileSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, wffSymbolId, alphaSymbolId, setvarSymbolId, aSymbolId, alphaSymbolId, aSymbolId]
      },
      systemId
    });
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
      distinctVariableRestrictions,
      variableTypeHypotheses,
      logicalHypotheses,
      assertion,
      proofAppearanceCount,
      systemId,
      createdByUserId
    });
    expect(statusCode).toBe(HttpStatus.CREATED);
    expect(body).toEqual({
      id: statementId.toString(),
      title,
      description,
      distinctVariableRestrictions: [
        [alphaSymbolId.toString(), aSymbolId.toString()]
      ],
      variableTypeHypotheses: [
        [wffSymbolId.toString(), alphaSymbolId.toString()],
        [setvarSymbolId.toString(), aSymbolId.toString()]
      ],
      logicalHypotheses: [
        [
          turnstileSymbolId.toString(),
          alphaSymbolId.toString(),
          turnstileSymbolId.toString()
        ]
      ],
      assertion: [
        turnstileSymbolId.toString(),
        aSymbolId.toString(),
        turnstileSymbolId.toString()
      ],
      proofAppearanceCount,
      systemId: systemId.toString(),
      createdByUserId: createdByUserId.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
