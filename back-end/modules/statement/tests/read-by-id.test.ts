import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { StatementEntity } from '@/statement/statement.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { StatementRepositoryMock } from './mocks/statement-repository.mock';

describe('Read Statement by ID', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails with an invalid statement ID', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system/1/statement/1');

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'statementId should be a mongodb id',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with an invalid system ID', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system/1/statement/${new ObjectId()}`);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'systemId should be a mongodb id',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the statement is not found', async (): Promise<void> => {
    const statementRepositoryMock = app.get(getRepositoryToken(StatementEntity)) as StatementRepositoryMock;

    statementRepositoryMock.findOneBy.mockReturnValueOnce(null);

    const response = await request(app.getHttpServer()).get(`/system/${new ObjectId()}/statement/${new ObjectId()}`);

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'Statement not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('succeeds', async (): Promise<void> => {
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

    statementRepositoryMock.findOneBy.mockReturnValueOnce(statement);

    const response = await request(app.getHttpServer()).get(`/system/${statement.systemId}/statement/${statement._id}`);

    expectCorrectResponse(response, HttpStatus.OK, {
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
      proofAppearances: statement.proofAppearances,
      proofSteps: statement.proofSteps,
      systemId: statement.systemId.toString(),
      createdByUserId: statement.createdByUserId.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
