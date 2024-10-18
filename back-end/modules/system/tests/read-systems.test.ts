import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SystemEntity } from '@/system/system.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SystemRepositoryMock } from './mocks/system-repository.mock';

describe('Read Systems', (): void => {
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

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message,
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it.each(goodQueries)('succeeds %s', async (goodQuery: string): Promise<void> => {
    const system = new SystemEntity();

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    systemRepositoryMock.findAndCount.mockReturnValueOnce([[system], 1]);

    const response = await request(app.getHttpServer()).get(`/system${goodQuery}`);

    expectCorrectResponse(response, HttpStatus.OK, {
      results: [
        {
          id: system._id.toString(),
          title: system.title,
          description: system.description,
          constantSymbolCount: system.constantSymbolCount,
          variableSymbolCount: system.variableSymbolCount,
          axiomCount: system.axiomCount,
          theoremCount: system.theoremCount,
          deductionCount: system.deductionCount,
          createdByUserId: system.createdByUserId.toString()
        }
      ],
      total: 1
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
