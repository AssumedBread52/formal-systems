import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { findMock } from '@/common/tests/mocks/find.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { StatementEntity } from '@/statement/statement.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Update Statement', (): void => {
  const find = findMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).patch('/system/1/statement/1');

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
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

    const response = await request(app.getHttpServer()).patch('/system/1/statement/1').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
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

    const response = await request(app.getHttpServer()).patch('/system/1/statement/1').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
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

    const response = await request(app.getHttpServer()).patch('/system/1/statement/1').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
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

  it('fails with an invalid statement ID', async (): Promise<void> => {
    const userId = new ObjectId();
    const user = new UserEntity();

    user._id = userId;

    findOneBy.mockResolvedValueOnce(user);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).patch('/system/1/statement/1').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
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

  it('fails with an invalid system ID', async (): Promise<void> => {
    const userId = new ObjectId();
    const user = new UserEntity();

    user._id = userId;

    findOneBy.mockResolvedValueOnce(user);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).patch(`/system/1/statement/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
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

  it('fails if the statement does not exist', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const userId = new ObjectId();
    const user = new UserEntity();

    user._id = userId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(body).toEqual({
      error: 'Not Found',
      message: 'Statement not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails if the user did not create the statement', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const userId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = userId;
    statement._id = statementId;
    statement.proofAppearanceCount = 1;
    statement.systemId = systemId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
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

  it('fails with an invalid title and description payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newDistinctVariableRestrictions: 'invalid',
      newVariableTypeHypotheses: 'invalid',
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'newTitle should not be empty',
        'newDescription should not be empty',
        'each value in newDistinctVariableRestrictions must be a distinct pair of mongodb ids',
        'newDistinctVariableRestrictions must be an array',
        'All newDistinctVariableRestrictions\'s elements must be unique',
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'newVariableTypeHypotheses must be an array',
        'All newVariableTypeHypotheses\'s elements must be unique',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid distinct variable restrictions payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: 'invalid',
      newVariableTypeHypotheses: 'invalid',
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newDistinctVariableRestrictions must be a distinct pair of mongodb ids',
        'newDistinctVariableRestrictions must be an array',
        'All newDistinctVariableRestrictions\'s elements must be unique',
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'newVariableTypeHypotheses must be an array',
        'All newVariableTypeHypotheses\'s elements must be unique',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid distinct variable restrictions payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        'invalid',
        'invalid'
      ],
      newVariableTypeHypotheses: 'invalid',
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newDistinctVariableRestrictions must be a distinct pair of mongodb ids',
        'All newDistinctVariableRestrictions\'s elements must be unique',
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'newVariableTypeHypotheses must be an array',
        'All newVariableTypeHypotheses\'s elements must be unique',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid distinct variable restrictions payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        ['invalid', 'invalid', 'invalid']
      ],
      newVariableTypeHypotheses: 'invalid',
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newDistinctVariableRestrictions must be a distinct pair of mongodb ids',
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'newVariableTypeHypotheses must be an array',
        'All newVariableTypeHypotheses\'s elements must be unique',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid distinct variable restrictions payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        ['invalid']
      ],
      newVariableTypeHypotheses: 'invalid',
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newDistinctVariableRestrictions must be a distinct pair of mongodb ids',
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'newVariableTypeHypotheses must be an array',
        'All newVariableTypeHypotheses\'s elements must be unique',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid distinct variable restrictions payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        ['invalid', 'invalid']
      ],
      newVariableTypeHypotheses: 'invalid',
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newDistinctVariableRestrictions must be a distinct pair of mongodb ids',
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'newVariableTypeHypotheses must be an array',
        'All newVariableTypeHypotheses\'s elements must be unique',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid distinct variable restrictions payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [new ObjectId(), 'invalid']
      ],
      newVariableTypeHypotheses: 'invalid',
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newDistinctVariableRestrictions must be a distinct pair of mongodb ids',
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'newVariableTypeHypotheses must be an array',
        'All newVariableTypeHypotheses\'s elements must be unique',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid distinct variable restrictions payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const symbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [symbolId, symbolId]
      ],
      newVariableTypeHypotheses: 'invalid',
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newDistinctVariableRestrictions must be a distinct pair of mongodb ids',
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'newVariableTypeHypotheses must be an array',
        'All newVariableTypeHypotheses\'s elements must be unique',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid variable type hypotheses payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      newVariableTypeHypotheses: 'invalid',
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'newVariableTypeHypotheses must be an array',
        'All newVariableTypeHypotheses\'s elements must be unique',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid variable type hypotheses payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      newVariableTypeHypotheses: [
        'invalid',
        'invalid'
      ],
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'All newVariableTypeHypotheses\'s elements must be unique',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid variable type hypotheses payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      newVariableTypeHypotheses: [
        ['invalid', 'invalid', 'invalid']
      ],
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid variable type hypotheses payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      newVariableTypeHypotheses: [
        ['invalid']
      ],
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid variable type hypotheses payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      newVariableTypeHypotheses: [
        ['invalid', 'invalid']
      ],
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid variable type hypotheses payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      newVariableTypeHypotheses: [
        [new ObjectId(), 'invalid']
      ],
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid variable type hypotheses payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const symbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      newVariableTypeHypotheses: [
        [symbolId, symbolId]
      ],
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid logical hypotheses payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      newVariableTypeHypotheses: [
        [new ObjectId(), new ObjectId()]
      ],
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'newLogicalHypotheses must be an array',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid logical hypotheses payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      newVariableTypeHypotheses: [
        [new ObjectId(), new ObjectId()]
      ],
      newLogicalHypotheses: [
        'invalid',
        'invalid'
      ],
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid logical hypotheses payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      newVariableTypeHypotheses: [
        [new ObjectId(), new ObjectId()]
      ],
      newLogicalHypotheses: [
        ['invalid'],
        ['invalid']
      ],
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid assertion payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      newVariableTypeHypotheses: [
        [new ObjectId(), new ObjectId()]
      ],
      newLogicalHypotheses: [
        [new ObjectId()]
      ],
      newAssertion: 'invalid'
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid assertion payload', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test Statement',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      newVariableTypeHypotheses: [
        [new ObjectId(), new ObjectId()]
      ],
      newLogicalHypotheses: [
        [new ObjectId()]
      ],
      newAssertion: [
        'invalid'
      ]
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message: [
        'each value in newAssertion must be a mongodb id'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails if the title is not unique in the system', async (): Promise<void> => {
    const statementId = new ObjectId();
    const newTitle = 'New Test Statement';
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();
    const conflictStatement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;
    conflictStatement.title = newTitle;
    conflictStatement.systemId = systemId;
    conflictStatement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(conflictStatement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [new ObjectId(), new ObjectId()]
      ],
      newVariableTypeHypotheses: [
        [new ObjectId(), new ObjectId()]
      ],
      newLogicalHypotheses: [
        [new ObjectId()]
      ],
      newAssertion: [
        new ObjectId()
      ]
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(0);
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
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
      message: 'Statements in the same system must have a unique title.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('fails if a symbol used does not exist in the system', async (): Promise<void> => {
    const statementId = new ObjectId();
    const newTitle = 'New Test Statement';
    const turnstileSymbolId = new ObjectId();
    const wffSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    find.mockResolvedValueOnce([]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [wffSymbolId, turnstileSymbolId]
      ],
      newVariableTypeHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      newLogicalHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      newAssertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      where: {
        _id: {
          $in: [aSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, wffSymbolId, turnstileSymbolId]
        },
        systemId
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      title: newTitle,
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

  it('fails if any distinct variable restriction has a first element that is a constant symbol', async (): Promise<void> => {
    const statementId = new ObjectId();
    const newTitle = 'New Test Statement';
    const turnstileSymbolId = new ObjectId();
    const wffSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const turnstileSymbol = new SymbolEntity();
    const wffSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
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
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    find.mockResolvedValueOnce([
      turnstileSymbol,
      wffSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [wffSymbolId, turnstileSymbolId]
      ],
      newVariableTypeHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      newLogicalHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      newAssertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      where: {
        _id: {
          $in: [aSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, wffSymbolId, turnstileSymbolId]
        },
        systemId
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
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
      message: 'Invalid symbol type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if any distinct variable restriction has a second element that is a constant symbol', async (): Promise<void> => {
    const statementId = new ObjectId();
    const newTitle = 'New Test Statement';
    const turnstileSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const turnstileSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
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
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    find.mockResolvedValueOnce([
      turnstileSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      newVariableTypeHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      newLogicalHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      newAssertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      where: {
        _id: {
          $in: [aSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId]
        },
        systemId
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
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
      message: 'Invalid symbol type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if any variable type hypothesis uses a variable symbol as a type', async (): Promise<void> => {
    const statementId = new ObjectId();
    const newTitle = 'New Test Statement';
    const turnstileSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const turnstileSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
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
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    find.mockResolvedValueOnce([
      turnstileSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [alphaSymbolId, aSymbolId]
      ],
      newVariableTypeHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      newLogicalHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      newAssertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      where: {
        _id: {
          $in: [aSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, aSymbolId]
        },
        systemId
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
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
      message: 'Invalid symbol type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if a variable type hypothesis types a constant symbol', async (): Promise<void> => {
    const statementId = new ObjectId();
    const newTitle = 'New Test Statement';
    const turnstileSymbolId = new ObjectId();
    const wffSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const turnstileSymbol = new SymbolEntity();
    const wffSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
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
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    find.mockResolvedValueOnce([
      turnstileSymbol,
      wffSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [alphaSymbolId, aSymbolId]
      ],
      newVariableTypeHypotheses: [
        [wffSymbolId, turnstileSymbolId]
      ],
      newLogicalHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      newAssertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      where: {
        _id: {
          $in: [aSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, wffSymbolId, turnstileSymbolId, alphaSymbolId, aSymbolId]
        },
        systemId
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
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
      message: 'Invalid symbol type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if any logical hypothesis is not prefixed by a constant symbol', async (): Promise<void> => {
    const statementId = new ObjectId();
    const newTitle = 'New Test Statement';
    const turnstileSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const turnstileSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
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
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    find.mockResolvedValueOnce([
      turnstileSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [alphaSymbolId, aSymbolId]
      ],
      newVariableTypeHypotheses: [],
      newLogicalHypotheses: [
        [alphaSymbolId, turnstileSymbolId]
      ],
      newAssertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      where: {
        _id: {
          $in: [aSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, aSymbolId]
        },
        systemId
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
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
      message: 'Invalid symbol type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if a variable symbol in any logical hypothesis does not have a corresponding variable type hypothesis', async (): Promise<void> => {
    const statementId = new ObjectId();
    const newTitle = 'New Test Statement';
    const turnstileSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const turnstileSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
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
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    find.mockResolvedValueOnce([
      turnstileSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [alphaSymbolId, aSymbolId]
      ],
      newVariableTypeHypotheses: [],
      newLogicalHypotheses: [
        [turnstileSymbolId, alphaSymbolId, turnstileSymbolId]
      ],
      newAssertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      where: {
        _id: {
          $in: [aSymbolId, turnstileSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, alphaSymbolId, aSymbolId]
        },
        systemId
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
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
      message: 'All variable symbols in all logical hypotheses and the assertion must have a corresponding variable type hypothesis.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the assertion is not prefixed by a constant symbol', async (): Promise<void> => {
    const statementId = new ObjectId();
    const newTitle = 'New Test Statement';
    const turnstileSymbolId = new ObjectId();
    const wffSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const turnstileSymbol = new SymbolEntity();
    const wffSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
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
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    find.mockResolvedValueOnce([
      turnstileSymbol,
      wffSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [alphaSymbolId, aSymbolId]
      ],
      newVariableTypeHypotheses: [
        [wffSymbolId, alphaSymbolId]
      ],
      newLogicalHypotheses: [
        [turnstileSymbolId, alphaSymbolId, turnstileSymbolId]
      ],
      newAssertion: [
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      where: {
        _id: {
          $in: [aSymbolId, turnstileSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, wffSymbolId, alphaSymbolId, alphaSymbolId, aSymbolId]
        },
        systemId
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
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
      message: 'Invalid symbol type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if a variable symbol in the assertion does not have a corresponding variable type hypothesis', async (): Promise<void> => {
    const statementId = new ObjectId();
    const newTitle = 'New Test Statement';
    const turnstileSymbolId = new ObjectId();
    const wffSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const turnstileSymbol = new SymbolEntity();
    const wffSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
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
    statement._id = statementId;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    find.mockResolvedValueOnce([
      turnstileSymbol,
      wffSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [alphaSymbolId, aSymbolId]
      ],
      newVariableTypeHypotheses: [
        [wffSymbolId, alphaSymbolId]
      ],
      newLogicalHypotheses: [
        [turnstileSymbolId, alphaSymbolId, turnstileSymbolId]
      ],
      newAssertion: [
        turnstileSymbolId,
        aSymbolId,
        turnstileSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      where: {
        _id: {
          $in: [turnstileSymbolId, aSymbolId, turnstileSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, wffSymbolId, alphaSymbolId, alphaSymbolId, aSymbolId]
        },
        systemId
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
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
      message: 'All variable symbols in all logical hypotheses and the assertion must have a corresponding variable type hypothesis.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the statement has one or more proofs', async (): Promise<void> => {
    const statementId = new ObjectId();
    const newTitle = 'New Test Statement';
    const turnstileSymbolId = new ObjectId();
    const wffSymbolId = new ObjectId();
    const setvarSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const turnstileSymbol = new SymbolEntity();
    const wffSymbol = new SymbolEntity();
    const setvarSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
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
    statement.proofCount = 1;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    find.mockResolvedValueOnce([
      turnstileSymbol,
      wffSymbol,
      setvarSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [alphaSymbolId, aSymbolId]
      ],
      newVariableTypeHypotheses: [
        [wffSymbolId, alphaSymbolId],
        [setvarSymbolId, aSymbolId]
      ],
      newLogicalHypotheses: [
        [turnstileSymbolId, alphaSymbolId, turnstileSymbolId]
      ],
      newAssertion: [turnstileSymbolId, aSymbolId, turnstileSymbolId]
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      where: {
        _id: {
          $in: [turnstileSymbolId, aSymbolId, turnstileSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, wffSymbolId, alphaSymbolId, setvarSymbolId, aSymbolId, alphaSymbolId, aSymbolId]
        },
        systemId
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
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
      message: 'Statements in use cannot under go write actions.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the statement is used in one or more proofs', async (): Promise<void> => {
    const statementId = new ObjectId();
    const newTitle = 'New Test Statement';
    const turnstileSymbolId = new ObjectId();
    const wffSymbolId = new ObjectId();
    const setvarSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const turnstileSymbol = new SymbolEntity();
    const wffSymbol = new SymbolEntity();
    const setvarSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
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
    statement.proofAppearanceCount = 1;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    find.mockResolvedValueOnce([
      turnstileSymbol,
      wffSymbol,
      setvarSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(null);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [alphaSymbolId, aSymbolId]
      ],
      newVariableTypeHypotheses: [
        [wffSymbolId, alphaSymbolId],
        [setvarSymbolId, aSymbolId]
      ],
      newLogicalHypotheses: [
        [turnstileSymbolId, alphaSymbolId, turnstileSymbolId]
      ],
      newAssertion: [turnstileSymbolId, aSymbolId, turnstileSymbolId]
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      where: {
        _id: {
          $in: [turnstileSymbolId, aSymbolId, turnstileSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, wffSymbolId, alphaSymbolId, setvarSymbolId, aSymbolId, alphaSymbolId, aSymbolId]
        },
        systemId
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
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
      message: 'Statements in use cannot under go write actions.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('succeeds', async (): Promise<void> => {
    const statementId = new ObjectId();
    const newTitle = 'New Test Statement';
    const newDescription = 'This is a new test.';
    const turnstileSymbolId = new ObjectId();
    const wffSymbolId = new ObjectId();
    const setvarSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();
    const proofCount = 0;
    const proofAppearanceCount = 0;
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const turnstileSymbol = new SymbolEntity();
    const wffSymbol = new SymbolEntity();
    const setvarSymbol = new SymbolEntity();
    const alphaSymbol = new SymbolEntity();
    const aSymbol = new SymbolEntity();
    const statement = new StatementEntity();
    const updatedStatement = new StatementEntity();
    const newDistinctVariableRestrictions = [
      [alphaSymbolId, aSymbolId]
    ] as [ObjectId, ObjectId][];
    const newVariableTypeHypotheses = [
      [wffSymbolId, alphaSymbolId],
      [setvarSymbolId, aSymbolId]
    ] as [ObjectId, ObjectId][];
    const newLogicalHypotheses = [
      [turnstileSymbolId, alphaSymbolId, turnstileSymbolId]
    ] as [ObjectId, ...ObjectId[]][];
    const newAssertion = [turnstileSymbolId, aSymbolId, turnstileSymbolId] as [ObjectId, ...ObjectId[]];

    user._id = createdByUserId;
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
    statement.proofCount = proofCount;
    statement.proofAppearanceCount = proofAppearanceCount;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;
    updatedStatement._id = statementId;
    updatedStatement.title = newTitle;
    updatedStatement.description = newDescription;
    updatedStatement.distinctVariableRestrictions = newDistinctVariableRestrictions;
    updatedStatement.variableTypeHypotheses = newVariableTypeHypotheses;
    updatedStatement.logicalHypotheses = newLogicalHypotheses;
    updatedStatement.assertion = newAssertion;
    updatedStatement.proofCount = proofCount;
    updatedStatement.proofAppearanceCount = proofAppearanceCount;
    updatedStatement.systemId = systemId;
    updatedStatement.createdByUserId = createdByUserId;

    find.mockResolvedValueOnce([
      turnstileSymbol,
      wffSymbol,
      setvarSymbol,
      alphaSymbol,
      aSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    findOneBy.mockResolvedValueOnce(null);
    save.mockResolvedValueOnce(updatedStatement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription,
      newDistinctVariableRestrictions,
      newVariableTypeHypotheses,
      newLogicalHypotheses,
      newAssertion
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      where: {
        _id: {
          $in: [turnstileSymbolId, aSymbolId, turnstileSymbolId, turnstileSymbolId, alphaSymbolId, turnstileSymbolId, wffSymbolId, alphaSymbolId, setvarSymbolId, aSymbolId, alphaSymbolId, aSymbolId]
        },
        systemId
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      title: newTitle,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      _id: statementId,
      title: newTitle,
      description: newDescription,
      distinctVariableRestrictions: newDistinctVariableRestrictions,
      variableTypeHypotheses: newVariableTypeHypotheses,
      logicalHypotheses: newLogicalHypotheses,
      assertion: newAssertion,
      proofCount,
      proofAppearanceCount,
      systemId,
      createdByUserId
    });
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
      id: statementId.toString(),
      title: newTitle,
      description: newDescription,
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
      proofCount,
      proofAppearanceCount,
      systemId: systemId.toString(),
      createdByUserId: createdByUserId.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
