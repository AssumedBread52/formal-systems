import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { StatementEntity } from '@/statement/statement.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Read Statement by ID', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails with an invalid statement ID', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system/1/statement/1');

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(0);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Invalid Object ID.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with an invalid system ID', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system/1/statement/${new ObjectId()}`);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(0);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
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

    findOneBy.mockResolvedValueOnce(null);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/statement/${statementId}`);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(body).toEqual({
      error: 'Not Found',
      message: 'Statement not found.',
      statusCode: HttpStatus.NOT_FOUND
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
    const proofAppearanceCount = 1;
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const statement = new StatementEntity();

    statement._id = statementId;
    statement.title = title;
    statement.description = description;
    statement.distinctVariableRestrictions = distinctVariableRestrictions;
    statement.variableTypeHypotheses = variableTypeHypotheses;
    statement.logicalHypotheses = logicalHypotheses;
    statement.assertion = assertion;
    statement.proofAppearanceCount = proofAppearanceCount;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(statement);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/statement/${statementId}`);

    const { statusCode, body } = response;

    const [prefix, ...expression] = assertion;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
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
      proofAppearanceCount,
      systemId: systemId.toString(),
      createdByUserId: createdByUserId.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
