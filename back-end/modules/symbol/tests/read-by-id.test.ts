import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Read Symbol by ID', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails with in invalid symbol ID', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system/1/symbol/1');

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(0);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Invalid Object ID.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails with in invalid system ID', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system/1/symbol/${new ObjectId()}`);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(0);
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      error: 'Unprocessable Entity',
      message: 'Invalid Object ID.',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the symbol does not exist', async (): Promise<void> => {
    const symbolId = new ObjectId();
    const systemId = new ObjectId();

    findOneBy.mockResolvedValueOnce(null);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/symbol/${symbolId}`);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: symbolId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(body).toEqual({
      error: 'Not Found',
      message: 'Symbol not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('succeeds', async (): Promise<void> => {
    const symbolId = new ObjectId();
    const title = 'Test Symbol';
    const description = 'This is a test.';
    const type = SymbolType.Variable;
    const content = '\\alpha';
    const axiomAppearances = 6;
    const theoremAppearances = 1;
    const deductionAppearances = 2;
    const systemId = new ObjectId();
    const createdByUserId = new ObjectId();
    const symbol = new SymbolEntity();

    symbol._id = symbolId;
    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.axiomAppearances = axiomAppearances;
    symbol.theoremAppearances = theoremAppearances;
    symbol.deductionAppearances = deductionAppearances;
    symbol.systemId = systemId;
    symbol.createdByUserId = createdByUserId;

    findOneBy.mockResolvedValueOnce(symbol);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/symbol/${symbolId}`);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: symbolId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
      id: symbolId.toString(),
      title,
      description,
      type,
      content,
      axiomAppearances,
      theoremAppearances,
      deductionAppearances,
      systemId: systemId.toString(),
      createdByUserId: createdByUserId.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
