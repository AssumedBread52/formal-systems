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
