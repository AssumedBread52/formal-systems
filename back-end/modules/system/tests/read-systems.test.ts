import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { RootFilterOperators } from 'typeorm';

describe('Read Systems', (): void => {
  const findAndCount = findAndCountMock();
  const getOrThrow = getOrThrowMock();
  const goodQueries = [
    '',
    '?page=2',
    '?pageSize=20',
    '?keywords[]=test',
    '?keywords[]=test&keywords[]=word',
    `?userIds[]=${new ObjectId()}`,
    `?userIds[]=${new ObjectId()}&userIds[]=${new ObjectId()}`
  ];
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it.each(goodQueries)('succeeds %s', async (goodQuery: string): Promise<void> => {
    const systemId = new ObjectId();
    const title = 'Test System';
    const description = 'This is a test.';
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const axiomCount = 6;
    const theoremCount = 1;
    const deductionCount = 2;
    const proofCount = 3;
    const createdByUserId = new ObjectId();
    const system = new MongoSystemEntity();
    const total = 1;

    system._id = systemId;
    system.title = title;
    system.description = description;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.axiomCount = axiomCount;
    system.theoremCount = theoremCount;
    system.deductionCount = deductionCount;
    system.proofCount = proofCount;
    system.createdByUserId = createdByUserId;

    findAndCount.mockResolvedValueOnce([[system], total]);

    const response = await request(app.getHttpServer()).get(`/system${goodQuery}`);

    const { statusCode, body } = response;

    const urlSearchParams = new URLSearchParams(goodQuery);
    const page = parseInt(urlSearchParams.get('page') ?? '1');
    const pageSize = parseInt(urlSearchParams.get('pageSize') ?? '10');
    const keywords = urlSearchParams.getAll('keywords[]');
    const userIds = urlSearchParams.getAll('userIds[]');
    const where = {} as RootFilterOperators<MongoSystemEntity>;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    if (0 !== userIds.length) {
      where.createdByUserId = {
        $in: userIds.map((userId: string): ObjectId => {
          return new ObjectId(userId);
        })
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
    expect(body).toEqual({
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
          createdByUserId: createdByUserId.toString()
        }
      ],
      total
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
