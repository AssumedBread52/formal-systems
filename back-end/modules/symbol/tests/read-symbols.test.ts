import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { RootFilterOperators } from 'typeorm';

describe('Read Symbols', (): void => {
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
    ['?types=', 'each value in types must be one of the following values: Constant, Variable', 'types must contain no more than 2 elements'],
    ['?types[]=', 'each value in types must be one of the following values: Constant, Variable']
  ];
  const goodQueries = [
    '',
    '?page=2',
    '?count=20',
    '?keywords[]=test',
    '?keywords[]=test&keywords[]=word',
    `?types[]=${SymbolType.Constant}`,
    `?types[]=${SymbolType.Constant}&types[]=${SymbolType.Variable}`
  ];
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it.each(badQueries)('fails %s', async (badQuery: string, ...message: string[]): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system/1/symbol${badQuery}`);

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

  it('fails with an invalid system ID', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system/1/symbol');

    const { statusCode, body } = response;

    expect(findAndCount).toHaveBeenCalledTimes(0);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Invalid Object ID.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it.each(goodQueries)('succeeds %s', async (goodQuery: string): Promise<void> => {
    const symbolId = new ObjectId();
    const title = 'Test Symbol';
    const description = 'This is a test.';
    const type = SymbolType.Variable;
    const content = '\\alpha';
    const axiomAppearanceCount = 6;
    const theoremAppearanceCount = 1;
    const deductionAppearanceCount = 2;
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const symbol = new SymbolEntity();
    const total = 1;

    symbol._id = symbolId;
    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.axiomAppearanceCount = axiomAppearanceCount;
    symbol.theoremAppearanceCount = theoremAppearanceCount;
    symbol.deductionAppearanceCount = deductionAppearanceCount;
    symbol.systemId = systemId;
    symbol.createdByUserId = createdByUserId;

    findAndCount.mockResolvedValueOnce([[symbol], total]);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/symbol${goodQuery}`);

    const { statusCode, body } = response;

    const urlSearchParams = new URLSearchParams(goodQuery);
    const page = parseInt(urlSearchParams.get('page') ?? '1');
    const count = parseInt(urlSearchParams.get('count') ?? '10');
    const keywords = urlSearchParams.getAll('keywords[]');
    const types = urlSearchParams.getAll('types[]');
    const where = {
      systemId
    } as RootFilterOperators<SymbolEntity>;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }
    if (0 !== types.length) {
      where.type = {
        $in: types
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
          id: symbolId.toString(),
          title,
          description,
          type,
          content,
          axiomAppearanceCount,
          theoremAppearanceCount,
          deductionAppearanceCount,
          systemId: systemId.toString(),
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
