import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { SystemEntity } from '@/system/system.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { RootFilterOperators } from 'typeorm';

describe('Read Systems', (): void => {
  const findAndCount = findAndCountMock();
  const getOrThrow = getOrThrowMock();
  const badQueries = [
    ['?page=a', 'page must not be less than 1', 'page must be an integer number'],
    ['?page=5.4', 'page must be an integer number'],
    ['?page=-2', 'page must not be less than 1'],
    ['?count=a', 'count must not be less than 1', 'count must be an integer number'],
    ['?count=5.4', 'count must be an integer number'],
    ['?count=-2', 'count must not be less than 1'],
    ['?keywords=', 'each value in keywords should not be empty', 'keywords must be an array'],
    ['?keywords[]=', 'each value in keywords should not be empty'],
    ['?userIds=', 'each value in userIds must be a mongodb id', 'userIds must be an array'],
    ['?userIds[]=', 'each value in userIds must be a mongodb id']
  ];
  const goodQueries = [
    '',
    '?page=2',
    '?count=20',
    '?keywords[]=test',
    '?keywords[]=test&keywords[]=word',
    `?userIds[]=${new ObjectId()}`,
    `?userIds[]=${new ObjectId()}&userIds[]=${new ObjectId()}`
  ];
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it.each(badQueries)('fails %s', async (badQuery: string, ...message: string[]): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system${badQuery}`);

    const { statusCode, body } = response;

    expect(findAndCount).toHaveBeenCalledTimes(0);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toEqual({
      error: 'Bad Request',
      message,
      statusCode: HttpStatus.BAD_REQUEST
    });
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
    const createdByUserId = new ObjectId();
    const system = new SystemEntity();
    const total = 1;

    system._id = systemId;
    system.title = title;
    system.description = description;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.axiomCount = axiomCount;
    system.theoremCount = theoremCount;
    system.deductionCount = deductionCount;
    system.createdByUserId = createdByUserId;

    findAndCount.mockResolvedValueOnce([[system], total]);

    const response = await request(app.getHttpServer()).get(`/system${goodQuery}`);

    const { statusCode, body } = response;

    const urlSearchParams = new URLSearchParams(goodQuery);
    const page = parseInt(urlSearchParams.get('page') ?? '1');
    const count = parseInt(urlSearchParams.get('count') ?? '10');
    const keywords = urlSearchParams.getAll('keywords[]');
    const userIds = urlSearchParams.getAll('userIds[]');
    const where = {} as RootFilterOperators<SystemEntity>;

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
      skip: (page - 1) * count,
      take: count,
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
