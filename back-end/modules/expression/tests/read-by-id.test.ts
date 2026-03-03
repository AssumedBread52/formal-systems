import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { MongoExpressionEntity } from '@/expression/entities/mongo-expression.entity';
import { ExpressionType } from '@/expression/enums/expression-type.enum';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Read Expression by ID', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/expression/:expressionId', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemId = new ObjectId();
    const firstSymbolId = new ObjectId();
    const secondSymbolId = new ObjectId();
    const expressionId = new ObjectId();
    const type = ExpressionType.constant_variable_pair;
    const expression = new MongoExpressionEntity();

    expression._id = expressionId;
    expression.symbolIds = [
      firstSymbolId,
      secondSymbolId
    ];
    expression.type = type;
    expression.systemId = systemId;
    expression.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(expression);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/expression/${expressionId}`);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: expressionId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      id: expressionId.toString(),
      symbolIds: [
        firstSymbolId.toString(),
        secondSymbolId.toString()
      ],
      type,
      systemId: systemId.toString(),
      createdByUserId: userId.toString()
    });
  });

  it('POST /graphql query expression', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemId = new ObjectId();
    const firstSymbolId = new ObjectId();
    const secondSymbolId = new ObjectId();
    const expressionId = new ObjectId();
    const symbolIds = [
      firstSymbolId,
      secondSymbolId
    ];
    const type = ExpressionType.constant_variable_pair;
    const expression = new MongoExpressionEntity();

    expression._id = expressionId;
    expression.symbolIds = symbolIds;
    expression.type = type;
    expression.systemId = systemId;
    expression.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(expression);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query expression($systemId: String!, $expressionId: String!) { expression(systemId: $systemId, expressionId: $expressionId) { id symbolIds type systemId createdByUserId } }',
      variables: {
        systemId,
        expressionId
      }
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: expressionId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        expression: {
          id: expressionId.toString(),
          symbolIds: [
            firstSymbolId.toString(),
            secondSymbolId.toString()
          ],
          type,
          systemId: systemId.toString(),
          createdByUserId: userId.toString()
        }
      }
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
