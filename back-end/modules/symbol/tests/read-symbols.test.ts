import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SymbolRepositoryMock } from './mocks/symbol-repository.mock';

describe('Read Symbols', (): void => {
  getOrThrowMock();

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
    `?types[]=${SymbolType.Constant}&userIds[]=${SymbolType.Variable}`
  ];
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails with an invalid system id', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system/1/symbol');

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'Invalid Mongodb ID structure.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it.each(badQueries)('fails %s', async (badQuery: string, ...message: string[]): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system/${new ObjectId()}/symbol${badQuery}`);

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message,
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it.each(goodQueries)('succeeds %s', async (goodQuery: string): Promise<void> => {
    const symbol = new SymbolEntity();

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    symbolRepositoryMock.findAndCount.mockReturnValueOnce([[symbol], 1]);

    const response = await request(app.getHttpServer()).get(`/system/${symbol.systemId}/symbol${goodQuery}`);

    expectCorrectResponse(response, HttpStatus.OK, {
      results: [
        {
          id: symbol._id.toString(),
          title: symbol.title,
          description: symbol.description,
          type: symbol.type,
          content: symbol.content,
          axiomAppearances: symbol.axiomAppearances,
          theoremAppearances: symbol.theoremAppearances,
          deductionAppearances: symbol.deductionAppearances,
          systemId: symbol.systemId.toString(),
          createdByUserId: symbol.createdByUserId.toString()
        }
      ],
      total: 1
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
