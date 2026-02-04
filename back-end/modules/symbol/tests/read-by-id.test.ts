import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { MongoSymbolEntity } from '@/symbol/entities/mongo-symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Read Symbol by ID', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/symbol/:symbolId', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemId = new ObjectId();
    const symbolId = new ObjectId();
    const title = 'TestSymbol1';
    const description = 'Test Symbol 1';
    const type = SymbolType.variable;
    const content = '\\alpha';
    const axiomAppearanceCount = 6;
    const theoremAppearanceCount = 1;
    const deductionAppearanceCount = 2;
    const proofAppearanceCount = 4;
    const symbol = new MongoSymbolEntity();

    symbol._id = symbolId;
    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.axiomAppearanceCount = axiomAppearanceCount;
    symbol.theoremAppearanceCount = theoremAppearanceCount;
    symbol.deductionAppearanceCount = deductionAppearanceCount;
    symbol.proofAppearanceCount = proofAppearanceCount;
    symbol.systemId = systemId;
    symbol.createdByUserId = userId;

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
    expect(body).toStrictEqual({
      id: symbolId.toString(),
      title,
      description,
      type,
      content,
      axiomAppearanceCount,
      theoremAppearanceCount,
      deductionAppearanceCount,
      proofAppearanceCount,
      systemId: systemId.toString(),
      createdByUserId: userId.toString()
    });
  });

  it('POST /graphql query symbol', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemId = new ObjectId();
    const symbolId = new ObjectId();
    const title = 'TestSymbol1';
    const description = 'Test Symbol 1';
    const type = SymbolType.variable;
    const content = '\\alpha';
    const axiomAppearanceCount = 6;
    const theoremAppearanceCount = 1;
    const deductionAppearanceCount = 2;
    const proofAppearanceCount = 4;
    const symbol = new MongoSymbolEntity();

    symbol._id = symbolId;
    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.axiomAppearanceCount = axiomAppearanceCount;
    symbol.theoremAppearanceCount = theoremAppearanceCount;
    symbol.deductionAppearanceCount = deductionAppearanceCount;
    symbol.proofAppearanceCount = proofAppearanceCount;
    symbol.systemId = systemId;
    symbol.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(symbol);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query symbol($systemId: String!, $symbolId: String!) { symbol(systemId: $systemId, symbolId: $symbolId) { id title description type content axiomAppearanceCount theoremAppearanceCount deductionAppearanceCount proofAppearanceCount systemId createdByUserId } }',
      variables: {
        systemId,
        symbolId
      }
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: symbolId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        symbol: {
          id: symbolId.toString(),
          title,
          description,
          type,
          content,
          axiomAppearanceCount,
          theoremAppearanceCount,
          deductionAppearanceCount,
          proofAppearanceCount,
          systemId: systemId.toString(),
          createdByUserId: userId.toString()
        }
      }
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
