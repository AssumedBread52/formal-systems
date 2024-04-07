import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SymbolRepositoryMock } from './mocks/symbol-repository.mock';

describe('Read Symbols', (): void => {
  let app: INestApplication;
  const badQueries = [
    ['?page=a', 'page must not be less than 1', 'page must be an integer number'],
    ['?page=5.4', 'page must be an integer number'],
    ['?page=-2', 'page must not be less than 1'],
    ['?count=a', 'count must not be less than 1', 'count must be an integer number'],
    ['?count=5.4', 'count must be an integer number'],
    ['?count=-2', 'count must not be less than 1'],
    ['?keywords=', 'each value in keywords should not be empty', 'keywords must be an array'],
    ['?keywords[]=', 'each value in keywords should not be empty'],
    ['?types=', 'each value in types must be one of the following values: CONSTANT, VARIABLE', 'types must contain no more than 2 elements'],
    ['?types[]=', 'each value in types must be one of the following values: CONSTANT, VARIABLE']
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

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
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
    const testSymbol = new SymbolEntity();

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    symbolRepositoryMock.findAndCount.mockReturnValueOnce([[testSymbol], 1]);

    const { _id, title, description, type, content, axiomAppearances, theoremAppearances, deductionAppearances, systemId, createdByUserId } = testSymbol;

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/symbol${goodQuery}`);

    expectCorrectResponse(response, HttpStatus.OK, {
      results: [
        {
          id: _id.toString(),
          title,
          description,
          type,
          content,
          axiomAppearances,
          theoremAppearances,
          deductionAppearances,
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
