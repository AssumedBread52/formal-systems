import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { AuthService } from '@/auth/auth.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { StatementEntity } from '@/statement/statement.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SymbolRepositoryMock } from '@/symbol/tests/mocks/symbol-repository.mock';
import { SystemEntity } from '@/system/system.entity';
import { SystemRepositoryMock } from '@/system/tests/mocks/system-repository.mock';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { StatementRepositoryMock } from './mocks/statement-repository.mock';

describe('Create Statement', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'post', '/system/1/statement');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'post', '/system/1/statement');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'post', '/system/1/statement');
  });

  it('fails with an invalid system ID', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post('/system/1/statement').set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'systemId should be a mongodb id',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with non arrays', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const chi = new SymbolEntity();
    const x = new SymbolEntity();

    testSystem.createdByUserId = testUser._id;
    turnstile.systemId = testSystem._id;
    turnstile.createdByUserId = testUser._id;
    wff.systemId = testSystem._id;
    wff.createdByUserId = testUser._id;
    setvar.systemId = testSystem._id;
    setvar.createdByUserId = testUser._id;
    openParenthesis.systemId = testSystem._id;
    openParenthesis.createdByUserId = testUser._id;
    closeParenthesis.systemId = testSystem._id;
    closeParenthesis.createdByUserId = testUser._id;
    implication.systemId = testSystem._id;
    implication.createdByUserId = testUser._id;
    forAll.systemId = testSystem._id;
    forAll.createdByUserId = testUser._id;
    phi.type = SymbolType.Variable;
    phi.systemId = testSystem._id;
    phi.createdByUserId = testUser._id;
    psi.type = SymbolType.Variable;
    psi.systemId = testSystem._id;
    psi.createdByUserId = testUser._id;
    chi.type = SymbolType.Variable;
    chi.systemId = testSystem._id;
    chi.createdByUserId = testUser._id;
    x.type = SymbolType.Variable;
    x.systemId = testSystem._id;
    x.createdByUserId = testUser._id;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(testUser._id);

    const response = await request(app.getHttpServer()).post(`/system/${testSystem._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: 'invalid',
      variableTypeHypotheses: 'invalid',
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
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

  it('fails with elements that are not arrays', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const chi = new SymbolEntity();
    const x = new SymbolEntity();

    testSystem.createdByUserId = testUser._id;
    turnstile.systemId = testSystem._id;
    turnstile.createdByUserId = testUser._id;
    wff.systemId = testSystem._id;
    wff.createdByUserId = testUser._id;
    setvar.systemId = testSystem._id;
    setvar.createdByUserId = testUser._id;
    openParenthesis.systemId = testSystem._id;
    openParenthesis.createdByUserId = testUser._id;
    closeParenthesis.systemId = testSystem._id;
    closeParenthesis.createdByUserId = testUser._id;
    implication.systemId = testSystem._id;
    implication.createdByUserId = testUser._id;
    forAll.systemId = testSystem._id;
    forAll.createdByUserId = testUser._id;
    phi.type = SymbolType.Variable;
    phi.systemId = testSystem._id;
    phi.createdByUserId = testUser._id;
    psi.type = SymbolType.Variable;
    psi.systemId = testSystem._id;
    psi.createdByUserId = testUser._id;
    chi.type = SymbolType.Variable;
    chi.systemId = testSystem._id;
    chi.createdByUserId = testUser._id;
    x.type = SymbolType.Variable;
    x.systemId = testSystem._id;
    x.createdByUserId = testUser._id;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(testUser._id);

    const response = await request(app.getHttpServer()).post(`/system/${testSystem._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id],
        'invalid'
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id],
        [wff._id, chi._id],
        [setvar._id, x._id],
        'invalid'
      ],
      logicalHypotheses: [
        'invalid'
      ],
      assertion: 'invalid'
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids',
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with a non mongodb id', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const chi = new SymbolEntity();
    const x = new SymbolEntity();

    testSystem.createdByUserId = testUser._id;
    turnstile.systemId = testSystem._id;
    turnstile.createdByUserId = testUser._id;
    wff.systemId = testSystem._id;
    wff.createdByUserId = testUser._id;
    setvar.systemId = testSystem._id;
    setvar.createdByUserId = testUser._id;
    openParenthesis.systemId = testSystem._id;
    openParenthesis.createdByUserId = testUser._id;
    closeParenthesis.systemId = testSystem._id;
    closeParenthesis.createdByUserId = testUser._id;
    implication.systemId = testSystem._id;
    implication.createdByUserId = testUser._id;
    forAll.systemId = testSystem._id;
    forAll.createdByUserId = testUser._id;
    phi.type = SymbolType.Variable;
    phi.systemId = testSystem._id;
    phi.createdByUserId = testUser._id;
    psi.type = SymbolType.Variable;
    psi.systemId = testSystem._id;
    psi.createdByUserId = testUser._id;
    chi.type = SymbolType.Variable;
    chi.systemId = testSystem._id;
    chi.createdByUserId = testUser._id;
    x.type = SymbolType.Variable;
    x.systemId = testSystem._id;
    x.createdByUserId = testUser._id;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(testUser._id);

    const response = await request(app.getHttpServer()).post(`/system/${testSystem._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id],
        [x._id, 'invalid id']
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id],
        [wff._id, chi._id],
        [setvar._id, x._id],
        [setvar._id, 'invalid id']
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          openParenthesis._id,
          psi._id,
          implication._id,
          chi._id,
          closeParenthesis._id,
          closeParenthesis._id,
          'invalid id'
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        openParenthesis._id,
        forAll._id,
        x._id,
        psi._id,
        implication._id,
        forAll._id,
        x._id,
        chi._id,
        closeParenthesis._id,
        closeParenthesis._id,
        'invalid id'
      ]
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids',
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'each value in assertion must be a mongodb id'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails elements that are too few', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const chi = new SymbolEntity();
    const x = new SymbolEntity();

    testSystem.createdByUserId = testUser._id;
    turnstile.systemId = testSystem._id;
    turnstile.createdByUserId = testUser._id;
    wff.systemId = testSystem._id;
    wff.createdByUserId = testUser._id;
    setvar.systemId = testSystem._id;
    setvar.createdByUserId = testUser._id;
    openParenthesis.systemId = testSystem._id;
    openParenthesis.createdByUserId = testUser._id;
    closeParenthesis.systemId = testSystem._id;
    closeParenthesis.createdByUserId = testUser._id;
    implication.systemId = testSystem._id;
    implication.createdByUserId = testUser._id;
    forAll.systemId = testSystem._id;
    forAll.createdByUserId = testUser._id;
    phi.type = SymbolType.Variable;
    phi.systemId = testSystem._id;
    phi.createdByUserId = testUser._id;
    psi.type = SymbolType.Variable;
    psi.systemId = testSystem._id;
    psi.createdByUserId = testUser._id;
    chi.type = SymbolType.Variable;
    chi.systemId = testSystem._id;
    chi.createdByUserId = testUser._id;
    x.type = SymbolType.Variable;
    x.systemId = testSystem._id;
    x.createdByUserId = testUser._id;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(testUser._id);

    const response = await request(app.getHttpServer()).post(`/system/${testSystem._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id],
        ['invalid']
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id],
        [wff._id, chi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          openParenthesis._id,
          psi._id,
          implication._id,
          chi._id,
          closeParenthesis._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        openParenthesis._id,
        forAll._id,
        x._id,
        psi._id,
        implication._id,
        forAll._id,
        x._id,
        chi._id,
        closeParenthesis._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails elements that are too long', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const chi = new SymbolEntity();
    const x = new SymbolEntity();

    testSystem.createdByUserId = testUser._id;
    turnstile.systemId = testSystem._id;
    turnstile.createdByUserId = testUser._id;
    wff.systemId = testSystem._id;
    wff.createdByUserId = testUser._id;
    setvar.systemId = testSystem._id;
    setvar.createdByUserId = testUser._id;
    openParenthesis.systemId = testSystem._id;
    openParenthesis.createdByUserId = testUser._id;
    closeParenthesis.systemId = testSystem._id;
    closeParenthesis.createdByUserId = testUser._id;
    implication.systemId = testSystem._id;
    implication.createdByUserId = testUser._id;
    forAll.systemId = testSystem._id;
    forAll.createdByUserId = testUser._id;
    phi.type = SymbolType.Variable;
    phi.systemId = testSystem._id;
    phi.createdByUserId = testUser._id;
    psi.type = SymbolType.Variable;
    psi.systemId = testSystem._id;
    psi.createdByUserId = testUser._id;
    chi.type = SymbolType.Variable;
    chi.systemId = testSystem._id;
    chi.createdByUserId = testUser._id;
    x.type = SymbolType.Variable;
    x.systemId = testSystem._id;
    x.createdByUserId = testUser._id;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(testUser._id);

    const response = await request(app.getHttpServer()).post(`/system/${testSystem._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id],
        ['invalid', 'invalid', 'invalid']
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id],
        [wff._id, chi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          openParenthesis._id,
          psi._id,
          implication._id,
          chi._id,
          closeParenthesis._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        openParenthesis._id,
        forAll._id,
        x._id,
        psi._id,
        implication._id,
        forAll._id,
        x._id,
        chi._id,
        closeParenthesis._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with a non mongodb id', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const chi = new SymbolEntity();
    const x = new SymbolEntity();

    testSystem.createdByUserId = testUser._id;
    turnstile.systemId = testSystem._id;
    turnstile.createdByUserId = testUser._id;
    wff.systemId = testSystem._id;
    wff.createdByUserId = testUser._id;
    setvar.systemId = testSystem._id;
    setvar.createdByUserId = testUser._id;
    openParenthesis.systemId = testSystem._id;
    openParenthesis.createdByUserId = testUser._id;
    closeParenthesis.systemId = testSystem._id;
    closeParenthesis.createdByUserId = testUser._id;
    implication.systemId = testSystem._id;
    implication.createdByUserId = testUser._id;
    forAll.systemId = testSystem._id;
    forAll.createdByUserId = testUser._id;
    phi.type = SymbolType.Variable;
    phi.systemId = testSystem._id;
    phi.createdByUserId = testUser._id;
    psi.type = SymbolType.Variable;
    psi.systemId = testSystem._id;
    psi.createdByUserId = testUser._id;
    chi.type = SymbolType.Variable;
    chi.systemId = testSystem._id;
    chi.createdByUserId = testUser._id;
    x.type = SymbolType.Variable;
    x.systemId = testSystem._id;
    x.createdByUserId = testUser._id;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(testUser._id);

    const response = await request(app.getHttpServer()).post(`/system/${testSystem._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id],
        ['invalid', phi._id]
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id],
        [wff._id, chi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          openParenthesis._id,
          psi._id,
          implication._id,
          chi._id,
          closeParenthesis._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        openParenthesis._id,
        forAll._id,
        x._id,
        psi._id,
        implication._id,
        forAll._id,
        x._id,
        chi._id,
        closeParenthesis._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with a pair of non unique values', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const chi = new SymbolEntity();
    const x = new SymbolEntity();

    testSystem.createdByUserId = testUser._id;
    turnstile.systemId = testSystem._id;
    turnstile.createdByUserId = testUser._id;
    wff.systemId = testSystem._id;
    wff.createdByUserId = testUser._id;
    setvar.systemId = testSystem._id;
    setvar.createdByUserId = testUser._id;
    openParenthesis.systemId = testSystem._id;
    openParenthesis.createdByUserId = testUser._id;
    closeParenthesis.systemId = testSystem._id;
    closeParenthesis.createdByUserId = testUser._id;
    implication.systemId = testSystem._id;
    implication.createdByUserId = testUser._id;
    forAll.systemId = testSystem._id;
    forAll.createdByUserId = testUser._id;
    phi.type = SymbolType.Variable;
    phi.systemId = testSystem._id;
    phi.createdByUserId = testUser._id;
    psi.type = SymbolType.Variable;
    psi.systemId = testSystem._id;
    psi.createdByUserId = testUser._id;
    chi.type = SymbolType.Variable;
    chi.systemId = testSystem._id;
    chi.createdByUserId = testUser._id;
    x.type = SymbolType.Variable;
    x.systemId = testSystem._id;
    x.createdByUserId = testUser._id;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(testUser._id);

    const response = await request(app.getHttpServer()).post(`/system/${testSystem._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id],
        [phi._id, phi._id]
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id],
        [wff._id, chi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          openParenthesis._id,
          psi._id,
          implication._id,
          chi._id,
          closeParenthesis._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        openParenthesis._id,
        forAll._id,
        x._id,
        psi._id,
        implication._id,
        forAll._id,
        x._id,
        chi._id,
        closeParenthesis._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with a missing system', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const chi = new SymbolEntity();
    const x = new SymbolEntity();

    testSystem.createdByUserId = testUser._id;
    turnstile.systemId = testSystem._id;
    turnstile.createdByUserId = testUser._id;
    wff.systemId = testSystem._id;
    wff.createdByUserId = testUser._id;
    setvar.systemId = testSystem._id;
    setvar.createdByUserId = testUser._id;
    openParenthesis.systemId = testSystem._id;
    openParenthesis.createdByUserId = testUser._id;
    closeParenthesis.systemId = testSystem._id;
    closeParenthesis.createdByUserId = testUser._id;
    implication.systemId = testSystem._id;
    implication.createdByUserId = testUser._id;
    forAll.systemId = testSystem._id;
    forAll.createdByUserId = testUser._id;
    phi.type = SymbolType.Variable;
    phi.systemId = testSystem._id;
    phi.createdByUserId = testUser._id;
    psi.type = SymbolType.Variable;
    psi.systemId = testSystem._id;
    psi.createdByUserId = testUser._id;
    chi.type = SymbolType.Variable;
    chi.systemId = testSystem._id;
    chi.createdByUserId = testUser._id;
    x.type = SymbolType.Variable;
    x.systemId = testSystem._id;
    x.createdByUserId = testUser._id;

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(testUser._id);

    const response = await request(app.getHttpServer()).post(`/system/${testSystem._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id]
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id],
        [wff._id, chi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          openParenthesis._id,
          psi._id,
          implication._id,
          chi._id,
          closeParenthesis._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        openParenthesis._id,
        forAll._id,
        x._id,
        psi._id,
        implication._id,
        forAll._id,
        x._id,
        chi._id,
        closeParenthesis._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'Statements cannot be added to a formal system that does not exist.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails when adding a statement to a system the user did not create', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const chi = new SymbolEntity();
    const x = new SymbolEntity();

    turnstile.systemId = testSystem._id;
    turnstile.createdByUserId = testUser._id;
    wff.systemId = testSystem._id;
    wff.createdByUserId = testUser._id;
    setvar.systemId = testSystem._id;
    setvar.createdByUserId = testUser._id;
    openParenthesis.systemId = testSystem._id;
    openParenthesis.createdByUserId = testUser._id;
    closeParenthesis.systemId = testSystem._id;
    closeParenthesis.createdByUserId = testUser._id;
    implication.systemId = testSystem._id;
    implication.createdByUserId = testUser._id;
    forAll.systemId = testSystem._id;
    forAll.createdByUserId = testUser._id;
    phi.type = SymbolType.Variable;
    phi.systemId = testSystem._id;
    phi.createdByUserId = testUser._id;
    psi.type = SymbolType.Variable;
    psi.systemId = testSystem._id;
    psi.createdByUserId = testUser._id;
    chi.type = SymbolType.Variable;
    chi.systemId = testSystem._id;
    chi.createdByUserId = testUser._id;
    x.type = SymbolType.Variable;
    x.systemId = testSystem._id;
    x.createdByUserId = testUser._id;

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(testSystem);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(testUser._id);

    const response = await request(app.getHttpServer()).post(`/system/${testSystem._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id]
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id],
        [wff._id, chi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          openParenthesis._id,
          psi._id,
          implication._id,
          chi._id,
          closeParenthesis._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        openParenthesis._id,
        forAll._id,
        x._id,
        psi._id,
        implication._id,
        forAll._id,
        x._id,
        chi._id,
        closeParenthesis._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'Statements cannot be added to formal systems unless you created them.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails with a missing symbol', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const chi = new SymbolEntity();
    const x = new SymbolEntity();

    testSystem.createdByUserId = testUser._id;
    turnstile.systemId = testSystem._id;
    turnstile.createdByUserId = testUser._id;
    wff.systemId = testSystem._id;
    wff.createdByUserId = testUser._id;
    setvar.systemId = testSystem._id;
    setvar.createdByUserId = testUser._id;
    openParenthesis.systemId = testSystem._id;
    openParenthesis.createdByUserId = testUser._id;
    closeParenthesis.systemId = testSystem._id;
    closeParenthesis.createdByUserId = testUser._id;
    implication.systemId = testSystem._id;
    implication.createdByUserId = testUser._id;
    forAll.systemId = testSystem._id;
    forAll.createdByUserId = testUser._id;
    phi.type = SymbolType.Variable;
    phi.systemId = testSystem._id;
    phi.createdByUserId = testUser._id;
    psi.type = SymbolType.Variable;
    psi.systemId = testSystem._id;
    psi.createdByUserId = testUser._id;
    chi.type = SymbolType.Variable;
    chi.systemId = testSystem._id;
    chi.createdByUserId = testUser._id;
    x.type = SymbolType.Variable;
    x.createdByUserId = testUser._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      openParenthesis,
      closeParenthesis,
      implication,
      forAll,
      phi,
      psi,
      chi
    ]);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(testSystem);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(testUser._id);

    const response = await request(app.getHttpServer()).post(`/system/${testSystem._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id]
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id],
        [wff._id, chi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          openParenthesis._id,
          psi._id,
          implication._id,
          chi._id,
          closeParenthesis._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        openParenthesis._id,
        forAll._id,
        x._id,
        psi._id,
        implication._id,
        forAll._id,
        x._id,
        chi._id,
        closeParenthesis._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All symbols must exist within the formal system.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with an invalid distinct variable restriction', async (): Promise<void> => {
    const testUser = new UserEntity();
    const testSystem = new SystemEntity();
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const chi = new SymbolEntity();
    const x = new SymbolEntity();

    testSystem.createdByUserId = testUser._id;
    turnstile.systemId = testSystem._id;
    turnstile.createdByUserId = testUser._id;
    wff.systemId = testSystem._id;
    wff.createdByUserId = testUser._id;
    setvar.systemId = testSystem._id;
    setvar.createdByUserId = testUser._id;
    openParenthesis.systemId = testSystem._id;
    openParenthesis.createdByUserId = testUser._id;
    closeParenthesis.systemId = testSystem._id;
    closeParenthesis.createdByUserId = testUser._id;
    implication.systemId = testSystem._id;
    implication.createdByUserId = testUser._id;
    forAll.systemId = testSystem._id;
    forAll.createdByUserId = testUser._id;
    phi.type = SymbolType.Variable;
    phi.systemId = testSystem._id;
    phi.createdByUserId = testUser._id;
    psi.type = SymbolType.Variable;
    psi.systemId = testSystem._id;
    psi.createdByUserId = testUser._id;
    chi.type = SymbolType.Variable;
    chi.systemId = testSystem._id;
    chi.createdByUserId = testUser._id;
    x.type = SymbolType.Variable;
    x.systemId = testSystem._id;
    x.createdByUserId = testUser._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      openParenthesis,
      closeParenthesis,
      implication,
      forAll,
      phi,
      psi,
      chi,
      x
    ]);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(testSystem);
    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const token = await app.get(AuthService).generateToken(testUser._id);

    const response = await request(app.getHttpServer()).post(`/system/${testSystem._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, openParenthesis._id],
        [phi._id, x._id]
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id],
        [wff._id, chi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          openParenthesis._id,
          psi._id,
          implication._id,
          chi._id,
          closeParenthesis._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        openParenthesis._id,
        forAll._id,
        x._id,
        psi._id,
        implication._id,
        forAll._id,
        x._id,
        chi._id,
        closeParenthesis._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All distinct variable restrictions must a pair of variable symbols.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if a variable type hypothesis types with a variable symbol', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const x = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    openParenthesis.systemId = system._id;
    openParenthesis.createdByUserId = user._id;
    closeParenthesis.systemId = system._id;
    closeParenthesis.createdByUserId = user._id;
    implication.systemId = system._id;
    implication.createdByUserId = user._id;
    forAll.systemId = system._id;
    forAll.createdByUserId = user._id;
    phi.type = SymbolType.Variable;
    phi.systemId = system._id;
    phi.createdByUserId = user._id;
    psi.type = SymbolType.Variable;
    psi.systemId = system._id;
    psi.createdByUserId = user._id;
    x.type = SymbolType.Variable;
    x.systemId = system._id;
    x.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      openParenthesis,
      closeParenthesis,
      implication,
      forAll,
      phi,
      psi,
      x
    ]);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${system._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id]
      ],
      variableTypeHypotheses: [
        [x._id, phi._id],
        [wff._id, psi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          psi._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        forAll._id,
        x._id,
        psi._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All variable type hypotheses must be a constant variable pair.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if a variable type hypothesis types a constant symbol', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const x = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    openParenthesis.systemId = system._id;
    openParenthesis.createdByUserId = user._id;
    closeParenthesis.systemId = system._id;
    closeParenthesis.createdByUserId = user._id;
    implication.systemId = system._id;
    implication.createdByUserId = user._id;
    forAll.systemId = system._id;
    forAll.createdByUserId = user._id;
    phi.type = SymbolType.Variable;
    phi.systemId = system._id;
    phi.createdByUserId = user._id;
    psi.type = SymbolType.Variable;
    psi.systemId = system._id;
    psi.createdByUserId = user._id;
    x.type = SymbolType.Variable;
    x.systemId = system._id;
    x.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      openParenthesis,
      closeParenthesis,
      implication,
      forAll,
      phi,
      psi,
      x
    ]);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${system._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id]
      ],
      variableTypeHypotheses: [
        [wff._id, openParenthesis._id],
        [wff._id, phi._id],
        [wff._id, psi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          psi._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        forAll._id,
        x._id,
        psi._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All variable type hypotheses must be a constant variable pair.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if any logical hypothesis does not start with a constant symbol', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const x = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    openParenthesis.systemId = system._id;
    openParenthesis.createdByUserId = user._id;
    closeParenthesis.systemId = system._id;
    closeParenthesis.createdByUserId = user._id;
    implication.systemId = system._id;
    implication.createdByUserId = user._id;
    forAll.systemId = system._id;
    forAll.createdByUserId = user._id;
    phi.type = SymbolType.Variable;
    phi.systemId = system._id;
    phi.createdByUserId = user._id;
    psi.type = SymbolType.Variable;
    psi.systemId = system._id;
    psi.createdByUserId = user._id;
    x.type = SymbolType.Variable;
    x.systemId = system._id;
    x.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      openParenthesis,
      closeParenthesis,
      implication,
      forAll,
      phi,
      psi,
      x
    ]);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${system._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id]
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          x._id,
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          psi._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        forAll._id,
        x._id,
        psi._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All logical hypotheses and the assertion must start with a constant symbol.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the assertion does not start with a constant symbol', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const x = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    openParenthesis.systemId = system._id;
    openParenthesis.createdByUserId = user._id;
    closeParenthesis.systemId = system._id;
    closeParenthesis.createdByUserId = user._id;
    implication.systemId = system._id;
    implication.createdByUserId = user._id;
    forAll.systemId = system._id;
    forAll.createdByUserId = user._id;
    phi.type = SymbolType.Variable;
    phi.systemId = system._id;
    phi.createdByUserId = user._id;
    psi.type = SymbolType.Variable;
    psi.systemId = system._id;
    psi.createdByUserId = user._id;
    x.type = SymbolType.Variable;
    x.systemId = system._id;
    x.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      openParenthesis,
      closeParenthesis,
      implication,
      forAll,
      phi,
      psi,
      x
    ]);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${system._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id]
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          psi._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        x._id,
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        forAll._id,
        x._id,
        psi._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All logical hypotheses and the assertion must start with a constant symbol.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if a variable symbol in any logical hypothesis does not have a corresponding varible type hypothesis', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const x = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    openParenthesis.systemId = system._id;
    openParenthesis.createdByUserId = user._id;
    closeParenthesis.systemId = system._id;
    closeParenthesis.createdByUserId = user._id;
    implication.systemId = system._id;
    implication.createdByUserId = user._id;
    forAll.systemId = system._id;
    forAll.createdByUserId = user._id;
    phi.type = SymbolType.Variable;
    phi.systemId = system._id;
    phi.createdByUserId = user._id;
    psi.type = SymbolType.Variable;
    psi.systemId = system._id;
    psi.createdByUserId = user._id;
    x.type = SymbolType.Variable;
    x.systemId = system._id;
    x.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      openParenthesis,
      closeParenthesis,
      implication,
      forAll,
      phi,
      psi,
      x
    ]);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${system._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id]
      ],
      variableTypeHypotheses: [
        [wff._id, psi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          psi._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        forAll._id,
        x._id,
        psi._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All variable symbols in any logical hypothesis or the assertion must have a corresponding variable type hypothesis.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if a variable symbol in the assertion does not have a corresponding varible type hypothesis', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const x = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    openParenthesis.systemId = system._id;
    openParenthesis.createdByUserId = user._id;
    closeParenthesis.systemId = system._id;
    closeParenthesis.createdByUserId = user._id;
    implication.systemId = system._id;
    implication.createdByUserId = user._id;
    forAll.systemId = system._id;
    forAll.createdByUserId = user._id;
    phi.type = SymbolType.Variable;
    phi.systemId = system._id;
    phi.createdByUserId = user._id;
    psi.type = SymbolType.Variable;
    psi.systemId = system._id;
    psi.createdByUserId = user._id;
    x.type = SymbolType.Variable;
    x.systemId = system._id;
    x.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      openParenthesis,
      closeParenthesis,
      implication,
      forAll,
      phi,
      psi,
      x
    ]);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${system._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id]
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          psi._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        forAll._id,
        x._id,
        psi._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All variable symbols in any logical hypothesis or the assertion must have a corresponding variable type hypothesis.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if another statement has the same assertion within the system', async (): Promise<void> => {
    const conflictStatement = new StatementEntity();
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const x = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    conflictStatement.distinctVariableRestrictions = [
      [phi._id, x._id]
    ];
    conflictStatement.variableTypeHypotheses = [
      [wff._id, phi._id],
      [wff._id, psi._id],
      [setvar._id, x._id]
    ];
    conflictStatement.logicalHypotheses = [
      [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        psi._id,
        closeParenthesis._id
      ]
    ];
    conflictStatement.assertion = [
      turnstile._id,
      openParenthesis._id,
      phi._id,
      implication._id,
      forAll._id,
      x._id,
      psi._id,
      closeParenthesis._id
    ];
    conflictStatement.systemId = system._id;
    conflictStatement.createdByUserId = user._id;
    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    openParenthesis.systemId = system._id;
    openParenthesis.createdByUserId = user._id;
    closeParenthesis.systemId = system._id;
    closeParenthesis.createdByUserId = user._id;
    implication.systemId = system._id;
    implication.createdByUserId = user._id;
    forAll.systemId = system._id;
    forAll.createdByUserId = user._id;
    phi.type = SymbolType.Variable;
    phi.systemId = system._id;
    phi.createdByUserId = user._id;
    psi.type = SymbolType.Variable;
    psi.systemId = system._id;
    psi.createdByUserId = user._id;
    x.type = SymbolType.Variable;
    x.systemId = system._id;
    x.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const statementRepositoryMock = app.get(getRepositoryToken(StatementEntity)) as StatementRepositoryMock;
    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    statementRepositoryMock.findOneBy.mockReturnValueOnce(conflictStatement);
    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      openParenthesis,
      closeParenthesis,
      implication,
      forAll,
      phi,
      psi,
      x
    ]);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${system._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id]
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          psi._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        forAll._id,
        x._id,
        psi._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Statements within a formal system must have a unique assertion.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const openParenthesis = new SymbolEntity();
    const closeParenthesis = new SymbolEntity();
    const implication = new SymbolEntity();
    const forAll = new SymbolEntity();
    const phi = new SymbolEntity();
    const psi = new SymbolEntity();
    const x = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    openParenthesis.systemId = system._id;
    openParenthesis.createdByUserId = user._id;
    closeParenthesis.systemId = system._id;
    closeParenthesis.createdByUserId = user._id;
    implication.systemId = system._id;
    implication.createdByUserId = user._id;
    forAll.systemId = system._id;
    forAll.createdByUserId = user._id;
    phi.type = SymbolType.Variable;
    phi.systemId = system._id;
    phi.createdByUserId = user._id;
    psi.type = SymbolType.Variable;
    psi.systemId = system._id;
    psi.createdByUserId = user._id;
    x.type = SymbolType.Variable;
    x.systemId = system._id;
    x.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const statementRepositoryMock = app.get(getRepositoryToken(StatementEntity)) as StatementRepositoryMock;
    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    statementRepositoryMock.findOneBy.mockReturnValueOnce(null);
    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      openParenthesis,
      closeParenthesis,
      implication,
      forAll,
      phi,
      psi,
      x
    ]);
    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${system._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [phi._id, x._id]
      ],
      variableTypeHypotheses: [
        [wff._id, phi._id],
        [wff._id, psi._id],
        [setvar._id, x._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          openParenthesis._id,
          phi._id,
          implication._id,
          psi._id,
          closeParenthesis._id
        ]
      ],
      assertion: [
        turnstile._id,
        openParenthesis._id,
        phi._id,
        implication._id,
        forAll._id,
        x._id,
        psi._id,
        closeParenthesis._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.CREATED, {});
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
