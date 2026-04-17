import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';

describe('Read Symbol by ID', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/symbol/:symbolId', async (): Promise<void> => {
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const symbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const symbol = validatePayload({
      id: symbolId,
      systemId,
      name: 'TestSymbol1',
      description: 'Test Symbol 1',
      type: SymbolType.variable,
      content: '\\alpha'
    }, SymbolEntity);

    findOneBy.mockResolvedValueOnce(symbol);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/symbol/${symbolId}`);

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: symbolId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual(instanceToPlain(symbol));
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql query symbol', async (): Promise<void> => {
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const symbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const symbol = validatePayload({
      id: symbolId,
      systemId,
      name: 'TestSymbol1',
      description: 'Test Symbol 1',
      type: SymbolType.variable,
      content: '\\alpha'
    }, SymbolEntity);

    findOneBy.mockResolvedValueOnce(symbol);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!, $symbolId: String!) { symbol(systemId: $systemId, symbolId: $symbolId) { id systemId name description type content } }',
      variables: {
        systemId,
        symbolId
      }
    });

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: symbolId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        symbol: instanceToPlain(symbol)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
