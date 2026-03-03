import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Read System by ID', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemId = new ObjectId();
    const title = 'TestSystem1';
    const description = 'Test System 1';
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const distinctVariablePairCount = 1;
    const constantVariablePairExpressionCount = 5;
    const constantPrefixedExpressionCount = 25;
    const standardExpressionCount = 125;
    const system = new MongoSystemEntity();

    system._id = systemId;
    system.title = title;
    system.description = description;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.distinctVariablePairCount = distinctVariablePairCount;
    system.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    system.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    system.standardExpressionCount = standardExpressionCount;
    system.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(system);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}`);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      id: systemId.toString(),
      title,
      description,
      constantSymbolCount,
      variableSymbolCount,
      distinctVariablePairCount,
      constantVariablePairExpressionCount,
      constantPrefixedExpressionCount,
      standardExpressionCount,
      createdByUserId: userId.toString()
    });
  });

  it('POST /graphql query system', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemId = new ObjectId();
    const title = 'TestSystem1';
    const description = 'Test System 1';
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const distinctVariablePairCount = 1;
    const constantVariablePairExpressionCount = 5;
    const constantPrefixedExpressionCount = 25;
    const standardExpressionCount = 125;
    const system = new MongoSystemEntity();

    system._id = systemId;
    system.title = title;
    system.description = description;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.distinctVariablePairCount = distinctVariablePairCount;
    system.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    system.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    system.standardExpressionCount = standardExpressionCount;
    system.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(system);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query system($systemId: String!) { system(systemId: $systemId) { id title description constantSymbolCount variableSymbolCount distinctVariablePairCount constantVariablePairExpressionCount constantPrefixedExpressionCount standardExpressionCount createdByUserId } }',
      variables: {
        systemId
      }
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        system: {
          id: systemId.toString(),
          title,
          description,
          constantSymbolCount,
          variableSymbolCount,
          distinctVariablePairCount,
          constantVariablePairExpressionCount,
          constantPrefixedExpressionCount,
          standardExpressionCount,
          createdByUserId: userId.toString()
        }
      }
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
