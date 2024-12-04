import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { removeMock } from '@/common/tests/mocks/remove.mock';
import { StatementEntity } from '@/statement/statement.entity';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Delete Statement', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const remove = removeMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).delete('/system/1/statement/1');

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

    const response = await request(app.getHttpServer()).delete('/system/1/statement/1').set('Cookie', [
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

    const response = await request(app.getHttpServer()).delete('/system/1/statement/1').set('Cookie', [
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

    const response = await request(app.getHttpServer()).delete('/system/1/statement/1').set('Cookie', [
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

  it('fails with an invalid statement ID', async (): Promise<void> => {
    const userId = new ObjectId();
    const user = new UserEntity();

    user._id = userId;

    findOneBy.mockResolvedValueOnce(user);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).delete('/system/1/statement/1').set('Cookie', [
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
    const statementId = new ObjectId();
    const userId = new ObjectId();
    const user = new UserEntity();

    user._id = userId;

    findOneBy.mockResolvedValueOnce(user);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).delete(`/system/1/statement/${statementId}`).set('Cookie', [
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

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(0);
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
    statement.title = 'Test Statement';
    statement.description = 'This is a test.';
    statement.distinctVariableRestrictions = [
      [new ObjectId(), new ObjectId()]
    ];
    statement.variableTypeHypotheses = [
      [new ObjectId(), new ObjectId()]
    ];
    statement.logicalHypotheses = [
      [new ObjectId()]
    ];
    statement.assertion = [
      new ObjectId()
    ];
    statement.proofAppearanceCount = 1;
    statement.systemId = systemId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
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

  it('fails if the statement has one or more proofs', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.title = 'Test Statement';
    statement.description = 'This is a test.';
    statement.distinctVariableRestrictions = [
      [new ObjectId(), new ObjectId()]
    ];
    statement.variableTypeHypotheses = [
      [new ObjectId(), new ObjectId()]
    ];
    statement.logicalHypotheses = [
      [new ObjectId()]
    ];
    statement.assertion = [
      new ObjectId()
    ];
    statement.proofCount = 1;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Statements in use cannot under go write actions.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the statement is used in one or more proofs', async (): Promise<void> => {
    const statementId = new ObjectId();
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.title = 'Test Statement';
    statement.description = 'This is a test.';
    statement.distinctVariableRestrictions = [
      [new ObjectId(), new ObjectId()]
    ];
    statement.variableTypeHypotheses = [
      [new ObjectId(), new ObjectId()]
    ];
    statement.logicalHypotheses = [
      [new ObjectId()]
    ];
    statement.assertion = [
      new ObjectId()
    ];
    statement.proofAppearanceCount = 1;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Statements in use cannot under go write actions.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('succeeds', async (): Promise<void> => {
    const statementId = new ObjectId();
    const title = 'Test Statement';
    const description = 'This is a test.';
    const distinctVariableRestrictions = [
      [new ObjectId(), new ObjectId()]
    ] as [ObjectId, ObjectId][];
    const variableTypeHypotheses = [
      [new ObjectId(), new ObjectId()]
    ] as [ObjectId, ObjectId][];
    const logicalHypotheses = [
      [new ObjectId()]
    ] as [ObjectId, ...ObjectId[]][];
    const assertion = [
      new ObjectId()
    ] as [ObjectId, ...ObjectId[]];
    const proofCount = 0;
    const proofAppearanceCount = 0;
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const user = new UserEntity();
    const statement = new StatementEntity();

    user._id = createdByUserId;
    statement._id = statementId;
    statement.title = title;
    statement.description = description;
    statement.distinctVariableRestrictions = distinctVariableRestrictions;
    statement.variableTypeHypotheses = variableTypeHypotheses;
    statement.logicalHypotheses = logicalHypotheses;
    statement.assertion = assertion;
    statement.proofCount = proofCount;
    statement.proofAppearanceCount = proofAppearanceCount;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(statement);
    remove.mockResolvedValueOnce(statement);

    const token = app.get(JwtService).sign({
      id: createdByUserId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/statement/${statementId}`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    const [prefix, ...expression] = assertion;

    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenNthCalledWith(1, statement);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
      id: statementId.toString(),
      title,
      description,
      distinctVariableRestrictions: distinctVariableRestrictions.map((distinctVariableRestriction: [ObjectId, ObjectId]): [string, string] => {
        const [first, second] = distinctVariableRestriction;

        return [
          first.toString(),
          second.toString()
        ];
      }),
      variableTypeHypotheses: variableTypeHypotheses.map((variableTypeHypothesis: [ObjectId, ObjectId]): [string, string] => {
        const [type, variable] = variableTypeHypothesis;

        return [
          type.toString(),
          variable.toString()
        ];
      }),
      logicalHypotheses: logicalHypotheses.map((logicalHypothesis: [ObjectId, ...ObjectId[]]): [string, ...string[]] => {
        const [prefix, ...expression] = logicalHypothesis;

        return [
          prefix.toString(),
          ...expression.map((symbolId: ObjectId): string => {
            return symbolId.toString();
          })
        ];
      }),
      assertion: [
        prefix.toString(),
        ...expression.map((symbolId: ObjectId): string => {
          return symbolId.toString();
        })
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
