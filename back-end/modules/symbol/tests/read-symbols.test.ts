import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { MongoSymbolEntity } from '@/symbol/entities/mongo-symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { Filter } from 'typeorm';

describe('Read Symbols', (): void => {
  const findAndCount = findAndCountMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/symbol', async (): Promise<void> => {
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
    const proofAppearanceCount = 6;
    const total = 1;
    const page = 2;
    const pageSize = 20;
    const keywords = ['Test'];
    const types = [SymbolType.variable];
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

    findAndCount.mockResolvedValueOnce([
      [
        symbol
      ],
      total
    ]);

    const urlSearchParams = new URLSearchParams;

    urlSearchParams.set('page', page.toString());
    urlSearchParams.set('pageSize', pageSize.toString());
    for (const keyword of keywords) {
      urlSearchParams.append('keywords[]', keyword);
    }
    for (const type of types) {
      urlSearchParams.append('types[]', type);
    }

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/symbol?${urlSearchParams}`);

    const { statusCode, body } = response;

    const where = {
      systemId
    } as Filter<MongoSymbolEntity>;

    if (0 < keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    if (0 < types.length) {
      where.type = {
        $in: types
      };
    }

    expect(findAndCount).toHaveBeenCalledTimes(1);
    expect(findAndCount).toHaveBeenNthCalledWith(1, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      where
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      results: [
        {
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
      ],
      total
    });
  });

  it ('POST /graphql query symbols', async (): Promise<void> => {
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
    const proofAppearanceCount = 6;
    const total = 1;
    const page = 2;
    const pageSize = 20;
    const keywords = ['Test'];
    const types = [SymbolType.variable];
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

    findAndCount.mockResolvedValueOnce([
      [
        symbol
      ],
      total
    ]);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query symbols($systemId: String!, $filters: SearchSymbolsPayload!) { symbols(systemId: $systemId, filters: $filters) { results { id title description type content axiomAppearanceCount theoremAppearanceCount deductionAppearanceCount proofAppearanceCount systemId createdByUserId } total } }',
      variables: {
        systemId,
        filters: {
          page,
          pageSize,
          keywords,
          types
        }
      }
    });

    const { statusCode, body } = response;

    const where = {
      systemId
    } as Filter<MongoSymbolEntity>;

    if (0 < keywords.length) {
      where.$text = {
        $caseSensitive: false,
        $search: keywords.join(',')
      };
    }

    if (0 < types.length) {
      where.type = {
        $in: types
      };
    }

    expect(findAndCount).toHaveBeenCalledTimes(1);
    expect(findAndCount).toHaveBeenNthCalledWith(1, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      where
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        symbols: {
          results: [
            {
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
          ],
          total
        }
      }
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
