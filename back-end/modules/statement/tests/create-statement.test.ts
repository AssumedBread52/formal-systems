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
import { ObjectId } from 'mongodb';
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

  it('fails with an invalid payload', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    alpha.type = SymbolType.Variable;
    alpha.systemId = system._id;
    alpha.createdByUserId = user._id;
    a.type = SymbolType.Variable;
    a.systemId = system._id;
    a.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${system._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      distinctVariableRestrictions: 'invalid',
      variableTypeHypotheses: 'invalid',
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
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

  it('fails if the system does not exist', async (): Promise<void> => {
    const systemId = new ObjectId();

    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const user = new UserEntity();

    turnstile.systemId = systemId;
    turnstile.createdByUserId = user._id;
    wff.systemId = systemId;
    wff.createdByUserId = user._id;
    setvar.systemId = systemId;
    setvar.createdByUserId = user._id;
    alpha.type = SymbolType.Variable;
    alpha.systemId = systemId;
    alpha.createdByUserId = user._id;
    a.type = SymbolType.Variable;
    a.systemId = systemId;
    a.createdByUserId = user._id;

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [alpha._id, a._id]
      ],
      variableTypeHypotheses: [
        [wff._id, alpha._id],
        [setvar._id, a._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          alpha._id
        ]
      ],
      assertion: [
        turnstile._id,
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'Statements cannot be added to a formal system that does not exist.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails if the user did not create the system', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    alpha.type = SymbolType.Variable;
    alpha.systemId = system._id;
    alpha.createdByUserId = user._id;
    a.type = SymbolType.Variable;
    a.systemId = system._id;
    a.createdByUserId = user._id;

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${system._id}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [alpha._id, a._id]
      ],
      variableTypeHypotheses: [
        [wff._id, alpha._id],
        [setvar._id, a._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          alpha._id
        ]
      ],
      assertion: [
        turnstile._id,
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'Statements cannot be added to formal systems unless you created them.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails if a symbol used does not exist in the system', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    alpha.type = SymbolType.Variable;
    alpha.systemId = system._id;
    alpha.createdByUserId = user._id;
    a.type = SymbolType.Variable;
    a.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      alpha
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
        [alpha._id, a._id]
      ],
      variableTypeHypotheses: [
        [wff._id, alpha._id],
        [setvar._id, a._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          alpha._id
        ]
      ],
      assertion: [
        turnstile._id,
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All symbols must exist within the formal system.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if any distinct variable restriction has a first element that is a constant symbol', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    alpha.type = SymbolType.Variable;
    alpha.systemId = system._id;
    alpha.createdByUserId = user._id;
    a.type = SymbolType.Variable;
    a.systemId = system._id;
    a.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      alpha,
      a
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
        [wff._id, alpha._id]
      ],
      variableTypeHypotheses: [
        [wff._id, alpha._id],
        [setvar._id, a._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          alpha._id
        ]
      ],
      assertion: [
        turnstile._id,
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All distinct variable restrictions must a pair of variable symbols.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if any distinct variable restriction has a second element that is a constant symbol', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const period = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    alpha.type = SymbolType.Variable;
    alpha.systemId = system._id;
    alpha.createdByUserId = user._id;
    a.type = SymbolType.Variable;
    a.systemId = system._id;
    a.createdByUserId = user._id;
    period.systemId = system._id;
    period.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      alpha,
      a,
      period
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
        [alpha._id, period._id]
      ],
      variableTypeHypotheses: [
        [wff._id, alpha._id],
        [setvar._id, a._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          alpha._id
        ]
      ],
      assertion: [
        turnstile._id,
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All distinct variable restrictions must a pair of variable symbols.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if any variable type hypothesis has a first element that is a variable symbol', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    alpha.type = SymbolType.Variable;
    alpha.systemId = system._id;
    alpha.createdByUserId = user._id;
    a.type = SymbolType.Variable;
    a.systemId = system._id;
    a.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      alpha,
      a
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
        [alpha._id, a._id]
      ],
      variableTypeHypotheses: [
        [wff._id, alpha._id],
        [alpha._id, a._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          alpha._id
        ]
      ],
      assertion: [
        turnstile._id,
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All variable type hypotheses must be a constant variable pair.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if any variable type hypothesis has a second element that is a constant symbol', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    alpha.type = SymbolType.Variable;
    alpha.systemId = system._id;
    alpha.createdByUserId = user._id;
    a.type = SymbolType.Variable;
    a.systemId = system._id;
    a.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      alpha,
      a
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
        [alpha._id, a._id]
      ],
      variableTypeHypotheses: [
        [wff._id, setvar._id],
        [setvar._id, a._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          alpha._id
        ]
      ],
      assertion: [
        turnstile._id,
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All variable type hypotheses must be a constant variable pair.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if any logical hypothesis is not prefixed by a constant symbol', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    alpha.type = SymbolType.Variable;
    alpha.systemId = system._id;
    alpha.createdByUserId = user._id;
    a.type = SymbolType.Variable;
    a.systemId = system._id;
    a.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      alpha,
      a
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
        [alpha._id, a._id]
      ],
      variableTypeHypotheses: [
        [wff._id, alpha._id],
        [setvar._id, a._id]
      ],
      logicalHypotheses: [
        [
          alpha._id
        ]
      ],
      assertion: [
        turnstile._id,
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All logical hypotheses and the assertion must start with a constant symbol.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the assertion is not prefixed by a constant symbol', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    alpha.type = SymbolType.Variable;
    alpha.systemId = system._id;
    alpha.createdByUserId = user._id;
    a.type = SymbolType.Variable;
    a.systemId = system._id;
    a.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      setvar,
      alpha,
      a
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
        [alpha._id, a._id]
      ],
      variableTypeHypotheses: [
        [wff._id, alpha._id],
        [setvar._id, a._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          alpha._id
        ]
      ],
      assertion: [
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All logical hypotheses and the assertion must start with a constant symbol.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if a variable symbol in any logical hypothesis does not have a corresponding variable type hypothesis', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    alpha.type = SymbolType.Variable;
    alpha.systemId = system._id;
    alpha.createdByUserId = user._id;
    a.type = SymbolType.Variable;
    a.systemId = system._id;
    a.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      setvar,
      alpha,
      a
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
        [alpha._id, a._id]
      ],
      variableTypeHypotheses: [
        [setvar._id, a._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          alpha._id
        ]
      ],
      assertion: [
        turnstile._id,
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All variable symbols in any logical hypothesis or the assertion must have a corresponding variable type hypothesis.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if a variable symbol in the assertion does not have a corresponding variable type hypothesis', async (): Promise<void> => {
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    alpha.type = SymbolType.Variable;
    alpha.systemId = system._id;
    alpha.createdByUserId = user._id;
    a.type = SymbolType.Variable;
    a.systemId = system._id;
    a.createdByUserId = user._id;
    system.createdByUserId = user._id;

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;
    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    symbolRepositoryMock.find.mockReturnValueOnce([
      turnstile,
      wff,
      alpha,
      a
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
        [alpha._id, a._id]
      ],
      variableTypeHypotheses: [
        [wff._id, alpha._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          alpha._id
        ]
      ],
      assertion: [
        turnstile._id,
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All variable symbols in any logical hypothesis or the assertion must have a corresponding variable type hypothesis.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if a statement has the same assertion', async (): Promise<void> => {
    const conflictStatement = new StatementEntity();
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    conflictStatement.assertion = [
      turnstile._id,
      a._id
    ];
    conflictStatement.systemId = system._id;
    conflictStatement.createdByUserId = user._id;
    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    alpha.type = SymbolType.Variable;
    alpha.systemId = system._id;
    alpha.createdByUserId = user._id;
    a.type = SymbolType.Variable;
    a.systemId = system._id;
    a.createdByUserId = user._id;
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
      alpha,
      a
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
        [alpha._id, a._id]
      ],
      variableTypeHypotheses: [
        [wff._id, alpha._id],
        [setvar._id, a._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          alpha._id
        ]
      ],
      assertion: [
        turnstile._id,
        a._id
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
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
    wff.systemId = system._id;
    wff.createdByUserId = user._id;
    setvar.systemId = system._id;
    setvar.createdByUserId = user._id;
    alpha.type = SymbolType.Variable;
    alpha.systemId = system._id;
    alpha.createdByUserId = user._id;
    a.type = SymbolType.Variable;
    a.systemId = system._id;
    a.createdByUserId = user._id;
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
      alpha,
      a
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
        [alpha._id, a._id]
      ],
      variableTypeHypotheses: [
        [wff._id, alpha._id],
        [setvar._id, a._id]
      ],
      logicalHypotheses: [
        [
          turnstile._id,
          alpha._id
        ]
      ],
      assertion: [
        turnstile._id,
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.CREATED, {});
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
