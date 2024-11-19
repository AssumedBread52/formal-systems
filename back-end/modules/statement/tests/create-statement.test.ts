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

  it('fails with an invalid symbol prefix in the assertion', async (): Promise<void> => {
    const title = 'Test Statement';
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
