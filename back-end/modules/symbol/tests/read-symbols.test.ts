import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SymbolRepositoryMock } from './mocks/symbol-repository.mock';

describe('Read Symbols', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails with a bad page query parameter', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system/${new ObjectId()}/symbol`);

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: 'Validation failed (numeric string is expected)',
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with a bad count query parameter', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system/${new ObjectId()}/symbol?page=1`);

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: 'Validation failed (numeric string is expected)',
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('succeeds without a keywords query parameter', async (): Promise<void> => {
    const testSymbol = new SymbolEntity();

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    symbolRepositoryMock.findAndCount.mockReturnValueOnce([[testSymbol], 1]);

    const { _id, title, description, type, content, axiomAppearances, theoremAppearances, deductionAppearances, systemId, createdByUserId } = testSymbol;

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/symbol?page=1&count=10`);

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

  it('succeeds with a single keywords query parameter', async (): Promise<void> => {
    const testSymbol = new SymbolEntity();

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    symbolRepositoryMock.findAndCount.mockReturnValueOnce([[testSymbol], 1]);

    const { _id, title, description, type, content, axiomAppearances, theoremAppearances, deductionAppearances, systemId, createdByUserId } = testSymbol;

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/symbol?page=1&count=10&keywords=test`);

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

  it('succeeds with multiple keywords query parameter', async (): Promise<void> => {
    const testSymbol = new SymbolEntity();

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    symbolRepositoryMock.findAndCount.mockReturnValueOnce([[testSymbol], 1]);

    const { _id, title, description, type, content, axiomAppearances, theoremAppearances, deductionAppearances, systemId, createdByUserId } = testSymbol;

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/symbol?page=1&count=10&keywords=test&keywords=user`);

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
