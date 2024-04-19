import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { StatementEntity } from '@/statement/statement.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { StatementRepositoryMock } from './mocks/statement-repository.mock';

describe('Read Statements', (): void => {
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

  it('fails with an invalid system ID', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system/1/statement');

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'systemId should be a mongodb id',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it.each(badQueries)('fails %s', async (badQuery: string, ...message: string[]): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system/${new ObjectId()}/statement${badQuery}`);

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message,
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it.each(goodQueries)('succeeds %s', async (goodQuery: string): Promise<void> => {
    const statement = new StatementEntity();

    statement.distinctVariableRestrictions = [
      [new ObjectId(), new ObjectId()]
    ];
    statement.variableTypeHypotheses = [
      [new ObjectId(), new ObjectId()]
    ];
    statement.logicalHypotheses = [
      [new ObjectId()]
    ];
    statement.assertion = [
      new ObjectId()
    ];

    const statementRepositoryMock = app.get(getRepositoryToken(StatementEntity)) as StatementRepositoryMock;

    statementRepositoryMock.findAndCount.mockReturnValueOnce([[statement], 1]);

    const response = await request(app.getHttpServer()).get(`/system/${new ObjectId()}/statement${goodQuery}`);

    expectCorrectResponse(response, HttpStatus.OK, {
      results: [
        {
          id: statement._id.toString(),
          title: statement.title,
          description: statement.description,
          distinctVariableRestrictions: statement.distinctVariableRestrictions.map((distinctVariableRestriction: [ObjectId, ObjectId]): [string, string] => {
            return [
              distinctVariableRestriction[0].toString(),
              distinctVariableRestriction[1].toString()
            ];
          }),
          variableTypeHypotheses: statement.variableTypeHypotheses.map((variableTypeHypothesis: [ObjectId, ObjectId]): [string, string] => {
            return [
              variableTypeHypothesis[0].toString(),
              variableTypeHypothesis[1].toString()
            ];
          }),
          logicalHypotheses: statement.logicalHypotheses.map((logicalHypothesis: ObjectId[]): string[] => {
            return logicalHypothesis.map((symbolId: ObjectId): string => {
              return symbolId.toString();
            });
          }),
          assertion: statement.assertion.map((symbolId: ObjectId): string => {
            return symbolId.toString();
          }),
          systemId: statement.systemId.toString(),
          createdByUserId: statement.createdByUserId.toString()
        }
      ],
      total: 1
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
