import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SymbolRepositoryMock } from './mocks/symbol-repository.mock';

describe('Read Symbol by ID', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails with in invalid symbol ID', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system/1/symbol/1');

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'symbolId should be a mongodb id',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with in invalid system ID', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system/1/symbol/${new ObjectId()}`);

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'systemId should be a mongodb id',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the symbol does not exist', async (): Promise<void> => {
    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(null);

    const response = await request(app.getHttpServer()).get(`/system/${new ObjectId()}/symbol/${new ObjectId()}`);

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'Symbol not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('succeeds', async (): Promise<void> => {
    const symbol = new SymbolEntity();

    const symbolRepositoryMock = app.get(getRepositoryToken(SymbolEntity)) as SymbolRepositoryMock;

    symbolRepositoryMock.findOneBy.mockReturnValueOnce(symbol);

    const response = await request(app.getHttpServer()).get(`/system/${symbol.systemId}/symbol/${symbol._id}`);

    expectCorrectResponse(response, HttpStatus.OK, {
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
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
