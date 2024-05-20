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
    ]).send({
      distinctVariableRestrictions: 'invalid',
      variableTypeHypotheses: 'invalid',
      logicalHypotheses: 'invalid',
      assertion: 'invalid'
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Invalid Mongodb ID structure.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/statement`).set('Cookie', [
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

  it('fails with an invalid payload', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        'invalid',
        'invalid',
      ],
      variableTypeHypotheses: [
        'invalid',
        'invalid',
      ],
      logicalHypotheses: [
        'invalid',
        'invalid'
      ],
      assertion: 'invalid'
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids',
        'All distinctVariableRestrictions\'s elements must be unique',
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'All variableTypeHypotheses\'s elements must be unique',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'All logicalHypotheses\'s elements must be unique',
        'each value in logicalHypotheses must contain at least 1 elements',
        'each value in assertion must be a mongodb id',
        'assertion must contain at least 1 elements'
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

    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        ['invalid', 'invalid', 'invalid'],
        ['invalid'],
        [symbolId, 'invalid'],
        ['invalid', symbolId],
        [symbolId, symbolId]
      ],
      variableTypeHypotheses: [
        ['invalid', 'invalid', 'invalid'],
        ['invalid'],
        [symbolId, 'invalid'],
        ['invalid', symbolId],
        [symbolId, symbolId]
      ],
      logicalHypotheses: [
        ['invalid'],
        ['invalid']
      ],
      assertion: [
        'invalid'
      ]
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'each value in distinctVariableRestrictions must be a distinct pair of mongodb ids',
        'All distinctVariableRestrictions\'s elements must be unique',
        'each value in variableTypeHypotheses must be a distinct pair of mongodb ids',
        'All variableTypeHypotheses\'s elements must be unique',
        'each value in each value in logicalHypotheses must be a mongodb id',
        'All logicalHypotheses\'s elements must be unique',
        'each value in assertion must be a mongodb id'
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

    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [symbolId1, symbolId2],
        [symbolId2, symbolId1]
      ],
      variableTypeHypotheses: [
        [symbolId1, symbolId2],
        [new ObjectId(), symbolId2]
      ],
      logicalHypotheses: [
        [symbolId1],
        [symbolId1]
      ],
      assertion: [
        symbolId1
      ]
    });

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'All distinctVariableRestrictions\'s elements must be unique',
        'All variableTypeHypotheses\'s elements must be unique',
        'All logicalHypotheses\'s elements must be unique',
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails if the system does not exist', async (): Promise<void> => {
    const wffSymbolId = new ObjectId();
    const setvarSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();

    const user = new UserEntity();

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;
    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(null);
    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = await app.get(AuthService).generateToken(user._id);

    const response = await request(app.getHttpServer()).post(`/system/${new ObjectId()}/statement`).set('Cookie', [
      `token=${token}`
    ]).send({
      title: 'Test',
      description: 'This is a test.',
      distinctVariableRestrictions: [
        [wffSymbolId, setvarSymbolId],
        [alphaSymbolId, wffSymbolId]
      ],
      variableTypeHypotheses: [
        [alphaSymbolId, wffSymbolId],
        [wffSymbolId, setvarSymbolId]
      ],
      logicalHypotheses: [
        [
          alphaSymbolId
        ]
      ],
      assertion: [
        aSymbolId
      ]
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'System not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails if the user did not create the system', async (): Promise<void> => {
    const wffSymbolId = new ObjectId();
    const setvarSymbolId = new ObjectId();
    const alphaSymbolId = new ObjectId();
    const aSymbolId = new ObjectId();

    const system = new SystemEntity();
    const user = new UserEntity();

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
        [wffSymbolId, setvarSymbolId],
        [alphaSymbolId, wffSymbolId]
      ],
      variableTypeHypotheses: [
        [alphaSymbolId, wffSymbolId],
        [wffSymbolId, setvarSymbolId]
      ],
      logicalHypotheses: [
        [
          alphaSymbolId
        ]
      ],
      assertion: [
        aSymbolId
      ]
    });

    expectCorrectResponse(response, HttpStatus.FORBIDDEN, {
      error: 'Forbidden',
      message: 'Write actions require user ownership.',
      statusCode: HttpStatus.FORBIDDEN
    });
  });

  it('fails if a symbol used does not exist in the system', async (): Promise<void> => {
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

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
        [wff._id, setvar._id],
        [alpha._id, wff._id]
      ],
      variableTypeHypotheses: [
        [alpha._id, wff._id],
        [wff._id, setvar._id]
      ],
      logicalHypotheses: [
        [
          alpha._id
        ]
      ],
      assertion: [
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'Symbol not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('fails if any distinct variable restriction has a first element that is a constant symbol', async (): Promise<void> => {
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

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
        [wff._id, setvar._id],
        [alpha._id, wff._id]
      ],
      variableTypeHypotheses: [
        [alpha._id, wff._id],
        [wff._id, setvar._id]
      ],
      logicalHypotheses: [
        [
          alpha._id
        ]
      ],
      assertion: [
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Invalid variable type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if any distinct variable restriction has a second element that is a constant symbol', async (): Promise<void> => {
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

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
        [alpha._id, wff._id]
      ],
      variableTypeHypotheses: [
        [alpha._id, wff._id],
        [wff._id, setvar._id]
      ],
      logicalHypotheses: [
        [
          alpha._id
        ]
      ],
      assertion: [
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Invalid variable type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if any variable type hypothesis has a first element that is a variable symbol', async (): Promise<void> => {
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

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
        [alpha._id, wff._id],
        [wff._id, setvar._id]
      ],
      logicalHypotheses: [
        [
          alpha._id
        ]
      ],
      assertion: [
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Invalid variable type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if any variable type hypothesis has a second element that is a constant symbol', async (): Promise<void> => {
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

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
        [wff._id, setvar._id]
      ],
      logicalHypotheses: [
        [
          alpha._id
        ]
      ],
      assertion: [
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Invalid variable type.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if any logical hypothesis is not prefixed by a constant symbol', async (): Promise<void> => {
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

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
      ],
      logicalHypotheses: [
        [
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
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    turnstile.systemId = system._id;
    turnstile.createdByUserId = user._id;
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
      message: 'All variable symbols in all logical hypotheses and the assertion must have a corresponding variable type hypothesis.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the assertion is not prefixed by a constant symbol', async (): Promise<void> => {
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
        a._id
      ]
    });

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'All logical hypotheses and the assertion must start with a constant symbol.',
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
      message: 'All variable symbols in all logical hypotheses and the assertion must have a corresponding variable type hypothesis.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if a statement has the same title', async (): Promise<void> => {
    const title = 'Test';

    const conflictStatement = new StatementEntity();
    const turnstile = new SymbolEntity();
    const wff = new SymbolEntity();
    const setvar = new SymbolEntity();
    const alpha = new SymbolEntity();
    const a = new SymbolEntity();
    const system = new SystemEntity();
    const user = new UserEntity();

    conflictStatement.title = title;
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
      title,
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
      message: 'Statements in the same system must have a unique title.',
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
