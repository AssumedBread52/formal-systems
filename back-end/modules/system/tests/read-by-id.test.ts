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
    const axiomCount = 6;
    const theoremCount = 1;
    const deductionCount = 3;
    const proofCount = 6;
    const system = new MongoSystemEntity();

    system._id = systemId;
    system.title = title;
    system.description = description;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.axiomCount = axiomCount;
    system.theoremCount = theoremCount;
    system.deductionCount = deductionCount;
    system.proofCount = proofCount;
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
      axiomCount,
      theoremCount,
      deductionCount,
      proofCount,
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
    const axiomCount = 6;
    const theoremCount = 1;
    const deductionCount = 3;
    const proofCount = 6;
    const system = new MongoSystemEntity();

    system._id = systemId;
    system.title = title;
    system.description = description;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.axiomCount = axiomCount;
    system.theoremCount = theoremCount;
    system.deductionCount = deductionCount;
    system.proofCount = proofCount;
    system.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(system);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'mutation system($systemId: String!) { system(systemId: $systemId) { id title description constantSymbolCount variableSymbolCount axiomCount theoremCount deductionCount proofCount createdByUserId } }',
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
          axiomCount,
          theoremCount,
          deductionCount,
          proofCount,
          createdByUserId: userId.toString()
        }
      }
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
