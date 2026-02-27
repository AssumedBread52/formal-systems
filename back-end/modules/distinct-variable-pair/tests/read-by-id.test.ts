import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { MongoDistinctVariablePairEntity } from '@/distinct-variable-pair/entities/mongo-distinct-variable-pair.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Read Distinct Variable Pair by ID', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/distinct-variable-pair/:distinctVariablePairId', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemId = new ObjectId();
    const firstSymbolId = new ObjectId();
    const secondSymbolId = new ObjectId();
    const distinctVariablePairId = new ObjectId();
    const distinctVariablePair = new MongoDistinctVariablePairEntity();

    distinctVariablePair._id = distinctVariablePairId;
    distinctVariablePair.variableSymbolIds = [
      firstSymbolId,
      secondSymbolId
    ];
    distinctVariablePair.systemId = systemId;
    distinctVariablePair.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(distinctVariablePair);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/distinct-variable-pair/${distinctVariablePairId}`);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: distinctVariablePairId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      id: distinctVariablePairId.toString(),
      variableSymbolIds: [
        firstSymbolId.toString(),
        secondSymbolId.toString()
      ],
      systemId: systemId.toString(),
      createdByUserId: userId.toString()
    });
  });

  it('POST /graphql query distinctVariablePair', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemId = new ObjectId();
    const firstSymbolId = new ObjectId();
    const secondSymbolId = new ObjectId();
    const distinctVariablePairId = new ObjectId();
    const distinctVariablePair = new MongoDistinctVariablePairEntity();

    distinctVariablePair._id = distinctVariablePairId;
    distinctVariablePair.variableSymbolIds = [
      firstSymbolId,
      secondSymbolId
    ];
    distinctVariablePair.systemId = systemId;
    distinctVariablePair.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(distinctVariablePair);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query distinctVariablePair($systemId: String!, $distinctVariablePairId: String!) { distinctVariablePair(systemId: $systemId, distinctVariablePairId: $distinctVariablePairId) { id variableSymbolIds systemId createdByUserId } }',
      variables: {
        systemId,
        distinctVariablePairId
      }
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: distinctVariablePairId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        distinctVariablePair: {
          id: distinctVariablePairId.toString(),
          variableSymbolIds: [
            firstSymbolId.toString(),
            secondSymbolId.toString()
          ],
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
