import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { Filter } from 'typeorm';

describe('Read Systems', (): void => {
  const findAndCount = findAndCountMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system', async (): Promise<void> => {
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
    const total = 1;
    const page = 2;
    const pageSize = 20;
    const keywords = ['Test'];
    const userIds = [userId];
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

    findAndCount.mockResolvedValueOnce([
      [
        system
      ],
      total
    ]);

    const urlSearchParams = new URLSearchParams;

    urlSearchParams.set('page', page.toString());
    urlSearchParams.set('pageSize', pageSize.toString());
    for (const keyword of keywords) {
      urlSearchParams.append('keywords[]', keyword);
    }
    for (const userId of userIds) {
      urlSearchParams.append('userIds[]', userId.toString());
    }

    const response = await request(app.getHttpServer()).get(`/system?${urlSearchParams}`);

    const { statusCode, body } = response;

    const where = {} as Filter<MongoSystemEntity>;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    if (0 !== userIds.length) {
      where.createdByUserId = {
        $in: userIds
      };
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
      ],
      total
    });
  });

  it('POST /graphql query systems', async (): Promise<void> => {
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
    const total = 1;
    const page = 2;
    const pageSize = 20;
    const keywords = ['Test'];
    const userIds = [userId];
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

    findAndCount.mockResolvedValueOnce([
      [
        system
      ],
      total
    ]);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query systems($filters: SearchSystemsPayload!) { systems(filters: $filters) { results { id title description constantSymbolCount variableSymbolCount axiomCount theoremCount deductionCount proofCount createdByUserId } total } }',
      variables: {
        filters: {
          page,
          pageSize,
          keywords,
          userIds
        }
      }
    });

    const { statusCode, body } = response;

    const where = {} as Filter<MongoSystemEntity>;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    if (0 !== userIds.length) {
      where.createdByUserId = {
        $in: userIds
      };
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
        systems: {
          results: [
            {
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
