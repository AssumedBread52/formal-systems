import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { StatementEntity } from '@/statement/statement.entity';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { StatementRepositoryMock } from './mocks/statement-repository.mock';

describe('Update Statement', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'patch', '/system/1/statement/1');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'patch', '/system/1/statement/1');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'patch', '/system/1/statement/1');
  });

  it('fails with an invalid statement ID', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch('/system/1/statement/1').set('Cookie', [
      `token=${token}`
    ]).send({
      newDistinctVariableRestrictions: 'invalid',
      newVariableTypeHypotheses: 'invalid',
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'statementId should be a mongodb id',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with an invalid system ID', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/1/statement/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newDistinctVariableRestrictions: 'invalid',
      newVariableTypeHypotheses: 'invalid',
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'systemId should be a mongodb id',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/statement/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newDistinctVariableRestrictions: 'invalid',
      newVariableTypeHypotheses: 'invalid',
      newLogicalHypotheses: 'invalid',
      newAssertion: 'invalid'
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
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

  it('fails with an invalid payload', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/statement/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        'invalid',
        'invalid'
      ],
      newVariableTypeHypotheses: [
        'invalid',
        'invalid'
      ],
      newLogicalHypotheses: [
        'invalid',
        'invalid'
      ],
      newAssertion: 'invalid'
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'each value in newDistinctVariableRestrictions must be a distinct pair of mongodb ids',
        'All newDistinctVariableRestrictions\'s elements must be unique',
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'All newVariableTypeHypotheses\'s elements must be unique',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newLogicalHypotheses must contain at least 1 elements',
        'each value in newAssertion must be a mongodb id',
        'newAssertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const symbolId = new ObjectId();

    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/statement/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        ['invalid', 'invalid', 'invalid'],
        ['invalid'],
        [symbolId, 'invalid'],
        ['invalid', symbolId],
        [symbolId, symbolId]
      ],
      newVariableTypeHypotheses: [
        ['invalid', 'invalid', 'invalid'],
        ['invalid'],
        [symbolId, 'invalid'],
        ['invalid', symbolId],
        [symbolId, symbolId]
      ],
      newLogicalHypotheses: [
        ['invalid'],
        ['invalid']
      ],
      newAssertion: [
        'invalid'
      ]
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'each value in newDistinctVariableRestrictions must be a distinct pair of mongodb ids',
        'All newDistinctVariableRestrictions\'s elements must be unique',
        'each value in newVariableTypeHypotheses must be a distinct pair of mongodb ids',
        'All newVariableTypeHypotheses\'s elements must be unique',
        'each value in each value in newLogicalHypotheses must be a mongodb id',
        'All newLogicalHypotheses\'s elements must be unique',
        'each value in newAssertion must be a mongodb id'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const symbolId1 = new ObjectId();
    const symbolId2 = new ObjectId();

    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/statement/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [symbolId1, symbolId2],
        [symbolId2, symbolId1]
      ],
      newVariableTypeHypotheses: [
        [symbolId1, symbolId2],
        [new ObjectId(), symbolId2]
      ],
      newLogicalHypotheses: [
        [symbolId1],
        [symbolId1]
      ],
      newAssertion: [
        symbolId1
      ]
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'All newDistinctVariableRestrictions\'s elements must be unique',
        'All newVariableTypeHypotheses\'s elements must be unique',
        'All newLogicalHypotheses\'s elements must be unique'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails if the statement does not exist', async (): Promise<void> => {
    const wffSymbolId = new ObjectId();
    const setvarSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();

    const user = new UserEntity();

    const statementRepositoryMock = app.get(getRepositoryToken(StatementEntity)) as StatementRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    statementRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch(`/system/${new ObjectId()}/statement/${new ObjectId()}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle: 'New Test',
      newDescription: 'This is a new test.',
      newDistinctVariableRestrictions: [
        [wffSymbolId, setvarSymbolId],
        [alphaSymbolId, wffSymbolId]
      ],
      newVariableTypeHypotheses: [
        [alphaSymbolId, wffSymbolId],
        [wffSymbolId, setvarSymbolId]
      ],
      newLogicalHypotheses: [
        [
          alphaSymbolId
        ]
      ],
      newAssertion: [
        aSymbolId
      ]
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'Statement not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
