import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { MongoDistinctVariablePairEntity } from '@/distinct-variable-pair/entities/mongo-distinct-variable-pair.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { Filter } from 'typeorm';

describe('Read Distinct Variable Pairs', (): void => {
  const findAndCount = findAndCountMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/distinct-variable-pair', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemId = new ObjectId();
    const firstSymbolId = new ObjectId();
    const secondSymbolId = new ObjectId();
    const distinctVariablePairId = new ObjectId();
    const page = 2;
    const pageSize = 20;
    const total = 21;
    const mustIncludeVariableSymbolIds = [firstSymbolId];
    const mayIncludeVariableSymbolIds = [secondSymbolId];
    const distinctVariablePair = new MongoDistinctVariablePairEntity();

    distinctVariablePair._id = distinctVariablePairId;
    distinctVariablePair.variableSymbolIds = [
      firstSymbolId,
      secondSymbolId
    ];
    distinctVariablePair.systemId = systemId;
    distinctVariablePair.createdByUserId = userId;

    findAndCount.mockResolvedValueOnce([
      [distinctVariablePair],
      total
    ]);

    const urlSearchParams = new URLSearchParams;
    urlSearchParams.set('page', page.toString());
    urlSearchParams.set('pageSize', pageSize.toString());
    for (const symbolId of mustIncludeVariableSymbolIds) {
      urlSearchParams.append('mustIncludeVariableSymbolIds[]', symbolId.toString());
    }
    for (const symbolId of mayIncludeVariableSymbolIds) {
      urlSearchParams.append('mayIncludeVariableSymbolIds[]', symbolId.toString());
    }

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/distinct-variable-pair?${urlSearchParams}`);

    const { statusCode, body } = response;

    const where = {
      systemId
    } as Filter<MongoDistinctVariablePairEntity>;
    if (0 < mustIncludeVariableSymbolIds.length || 0 < mayIncludeVariableSymbolIds.length) {
      where.variableSymbolIds = {};
      if (0 < mustIncludeVariableSymbolIds.length) {
        where.variableSymbolIds.$all = mustIncludeVariableSymbolIds;
      }
      if (0 < mayIncludeVariableSymbolIds.length) {
        where.variableSymbolIds.$in = mayIncludeVariableSymbolIds;
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
          id: distinctVariablePairId.toString(),
          variableSymbolIds: [
            firstSymbolId.toString(),
            secondSymbolId.toString()
          ],
          systemId: systemId.toString(),
          createdByUserId: userId.toString()
        }
      ],
      total
    });
  });

  it('POST /graphql query distinctVariablePairs', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemId = new ObjectId();
    const firstSymbolId = new ObjectId();
    const secondSymbolId = new ObjectId();
    const distinctVariablePairId = new ObjectId();
    const page = 2;
    const pageSize = 20;
    const total = 21;
    const mustIncludeVariableSymbolIds = [firstSymbolId];
    const mayIncludeVariableSymbolIds = [secondSymbolId];
    const distinctVariablePair = new MongoDistinctVariablePairEntity();

    distinctVariablePair._id = distinctVariablePairId;
    distinctVariablePair.variableSymbolIds = [
      firstSymbolId,
      secondSymbolId
    ];
    distinctVariablePair.systemId = systemId;
    distinctVariablePair.createdByUserId = userId;

    findAndCount.mockResolvedValueOnce([
      [distinctVariablePair],
      total
    ]);

    const urlSearchParams = new URLSearchParams;
    urlSearchParams.set('page', page.toString());
    urlSearchParams.set('pageSize', pageSize.toString());
    for (const symbolId of mustIncludeVariableSymbolIds) {
      urlSearchParams.append('mustIncludeVariableSymbolIds[]', symbolId.toString());
    }
    for (const symbolId of mayIncludeVariableSymbolIds) {
      urlSearchParams.append('mayIncludeVariableSymbolIds[]', symbolId.toString());
    }

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query distinctVariablePairs($systemId: String!, $filters: SearchDistinctVariablePairsPayload!) { distinctVariablePairs(systemId: $systemId, filters: $filters) { results { id variableSymbolIds systemId createdByUserId } total } }',
      variables: {
        systemId,
        filters: {
          page,
          pageSize,
          mustIncludeVariableSymbolIds,
          mayIncludeVariableSymbolIds
        }
      }
    });

    const { statusCode, body } = response;

    const where = {
      systemId
    } as Filter<MongoDistinctVariablePairEntity>;
    if (0 < mustIncludeVariableSymbolIds.length || 0 < mayIncludeVariableSymbolIds.length) {
      where.variableSymbolIds = {};
      if (0 < mustIncludeVariableSymbolIds.length) {
        where.variableSymbolIds.$all = mustIncludeVariableSymbolIds;
      }
      if (0 < mayIncludeVariableSymbolIds.length) {
        where.variableSymbolIds.$in = mayIncludeVariableSymbolIds;
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
        distinctVariablePairs: {
          results: [
            {
              id: distinctVariablePairId.toString(),
              variableSymbolIds: [
                firstSymbolId.toString(),
                secondSymbolId.toString()
              ],
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
