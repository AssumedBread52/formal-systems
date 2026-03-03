import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { MongoExpressionEntity } from '@/expression/entities/mongo-expression.entity';
import { ExpressionType } from '@/expression/enums/expression-type.enum';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { Filter } from 'typeorm';

describe('Read Expressions', (): void => {
  const findAndCount = findAndCountMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/expression', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemId = new ObjectId();
    const firstSymbolId = new ObjectId();
    const secondSymbolId = new ObjectId();
    const expressionId = new ObjectId();
    const type = ExpressionType.constant_variable_pair;
    const page = 2;
    const pageSize = 20;
    const total = 21;
    const mustIncludeSymbolIds = [firstSymbolId];
    const mayIncludeSymbolIds = [secondSymbolId];
    const expression = new MongoExpressionEntity();

    expression._id = expressionId;
    expression.symbolIds = [
      firstSymbolId,
      secondSymbolId
    ];
    expression.type = type;
    expression.systemId = systemId;
    expression.createdByUserId = userId;

    findAndCount.mockResolvedValueOnce([
      [expression],
      total
    ]);

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('page', page.toString());
    urlSearchParams.set('pageSize', pageSize.toString());
    for (const symbolId of mustIncludeSymbolIds) {
      urlSearchParams.append('mustIncludeSymbolIds[]', symbolId.toString());
    }
    for (const symbolId of mayIncludeSymbolIds) {
      urlSearchParams.append('mayIncludeSymbolIds[]', symbolId.toString());
    }

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/expression?${urlSearchParams}`);

    const { statusCode, body } = response;

    const where = {
      systemId
    } as Filter<MongoExpressionEntity>;
    if (0 < mustIncludeSymbolIds.length || 0 < mayIncludeSymbolIds.length) {
      where.symbolIds = {};
      if (0 < mustIncludeSymbolIds.length) {
        where.symbolIds.$all = mustIncludeSymbolIds;
      }
      if (0 < mayIncludeSymbolIds.length) {
        where.symbolIds.$in = mayIncludeSymbolIds;
      }
    }

    expect(findAndCount).toHaveBeenCalledTimes(1);
    expect(findAndCount).toHaveBeenNthCalledWith(1, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      where
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      results: [
        {
          id: expressionId.toString(),
          symbolIds: [
            firstSymbolId.toString(),
            secondSymbolId.toString()
          ],
          type,
          systemId: systemId.toString(),
          createdByUserId: userId.toString()
        }
      ],
      total
    });
  });

  it('POST /graphql query expressions', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemId = new ObjectId();
    const firstSymbolId = new ObjectId();
    const secondSymbolId = new ObjectId();
    const expressionId = new ObjectId();
    const type = ExpressionType.constant_variable_pair;
    const page = 2;
    const pageSize = 20;
    const total = 21;
    const mustIncludeSymbolIds = [firstSymbolId];
    const mayIncludeSymbolIds = [secondSymbolId];
    const expression = new MongoExpressionEntity();

    expression._id = expressionId;
    expression.symbolIds = [
      firstSymbolId,
      secondSymbolId
    ];
    expression.type = type;
    expression.systemId = systemId;
    expression.createdByUserId = userId;

    findAndCount.mockResolvedValueOnce([
      [expression],
      total
    ]);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query expressions($systemId: String!, $filters: SearchExpressionsPayload!) { expressions(systemId: $systemId, filters: $filters) { results { id symbolIds type systemId createdByUserId } total } }',
      variables: {
        systemId,
        filters: {
          page,
          pageSize,
          mustIncludeSymbolIds,
          mayIncludeSymbolIds
        }
      }
    });

    const { statusCode, body } = response;

    const where = {
      systemId
    } as Filter<MongoExpressionEntity>;
    if (0 < mustIncludeSymbolIds.length || 0 < mayIncludeSymbolIds.length) {
      where.symbolIds = {};
      if (0 < mustIncludeSymbolIds.length) {
        where.symbolIds.$all = mustIncludeSymbolIds;
      }
      if (0 < mayIncludeSymbolIds.length) {
        where.symbolIds.$in = mayIncludeSymbolIds;
      }
    }

    expect(findAndCount).toHaveBeenCalledTimes(1);
    expect(findAndCount).toHaveBeenNthCalledWith(1, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      where
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        expressions: {
          results: [
            {
              id: expressionId.toString(),
              symbolIds: [
                firstSymbolId.toString(),
                secondSymbolId.toString()
              ],
              type,
              systemId: systemId.toString(),
              createdByUserId: userId.toString()
            }
          ],
          total
        }
      }
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
