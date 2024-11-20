import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { StatementEntity } from '@/statement/statement.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { RootFilterOperators } from 'typeorm';

describe('Read Statements', (): void => {
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
    ['?keywords[]=', 'each value in keywords should not be empty']
  ];
  const goodQueries = [
    '',
    '?page=2',
    '?count=20',
    '?keywords[]=test',
    '?keywords[]=test&keywords[]=word'
  ];
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it.each(badQueries)('fails %s', async (badQuery: string, ...message: string[]): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system/1/statement${badQuery}`);

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
    const response = await request(app.getHttpServer()).get('/system/1/statement');

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
    const statementId = new ObjectId();
    const title = 'Test Statement';
    const description = 'This is a test.';
    const distinctVariableRestrictions = [
      [new ObjectId(), new ObjectId()]
    ] as [ObjectId, ObjectId][];
    const variableTypeHypotheses = [
      [new ObjectId(), new ObjectId()]
    ] as [ObjectId, ObjectId][];
    const logicalHypotheses = [
      [new ObjectId()]
    ] as [ObjectId, ...ObjectId[]][];
    const assertion = [
      new ObjectId()
    ] as [ObjectId, ...ObjectId[]];
    const proofAppearanceCount = 1;
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const statement = new StatementEntity();
    const total = 1;

    statement._id = statementId;
    statement.title = title;
    statement.description = description;
    statement.distinctVariableRestrictions = distinctVariableRestrictions;
    statement.variableTypeHypotheses = variableTypeHypotheses;
    statement.logicalHypotheses = logicalHypotheses;
    statement.assertion = assertion;
    statement.proofAppearanceCount = proofAppearanceCount;
    statement.systemId = systemId;
    statement.createdByUserId = createdByUserId;

    findAndCount.mockResolvedValueOnce([[statement], total]);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/statement${goodQuery}`);

    const { statusCode, body } = response;

    const [prefix, ...expression] = assertion;

    const urlSearchParams = new URLSearchParams(goodQuery);
    const page = parseInt(urlSearchParams.get('page') ?? '1');
    const count = parseInt(urlSearchParams.get('count') ?? '10');
    const keywords = urlSearchParams.getAll('keywords[]');
    const where = {
      systemId
    } as RootFilterOperators<StatementEntity>;

    if (0 !== keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
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
          id: statementId.toString(),
          title,
          description,
          distinctVariableRestrictions: distinctVariableRestrictions.map((distinctVariableRestriction: [ObjectId, ObjectId]): [string, string] => {
            const [first, second] = distinctVariableRestriction;

            return [
              first.toString(),
              second.toString()
            ];
          }),
          variableTypeHypotheses: variableTypeHypotheses.map((variableTypeHypothesis: [ObjectId, ObjectId]): [string, string] => {
            const [type, variable] = variableTypeHypothesis;

            return [
              type.toString(),
              variable.toString()
            ];
          }),
          logicalHypotheses: logicalHypotheses.map((logicalHypothesis: [ObjectId, ...ObjectId[]]): [string, ...string[]] => {
            const [prefix, ...expression] = logicalHypothesis;

            return [
              prefix.toString(),
              ...expression.map((symbolId: ObjectId): string => {
                return symbolId.toString();
              })
            ];
          }),
          assertion: [
            prefix.toString(),
            ...expression.map((symbolId: ObjectId): string => {
              return symbolId.toString();
            })
          ],
          proofAppearanceCount,
          systemId: systemId.toString(),
          createdByUserId: createdByUserId.toString()
        }
      ],
      total: 1
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
