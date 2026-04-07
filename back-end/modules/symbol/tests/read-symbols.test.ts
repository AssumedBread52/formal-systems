import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { ILike, In } from 'typeorm';

describe('Read Symbols', (): void => {
  const findAndCount = findAndCountMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/symbol', async (): Promise<void> => {
    const page = 2;
    const pageSize = 20;
    const searchText = 't S';
    const total = 1;
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const type = SymbolType.variable;
    const symbol = validatePayload({
      id: '7bde3313-f751-42f0-8d89-88c4ab394282',
      systemId,
      name: 'TestSymbol1',
      description: 'Test Symbol 1',
      type,
      content: '\\alpha'
    }, SymbolEntity);

    findAndCount.mockResolvedValueOnce([[
      symbol
    ], total]);

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('page', page.toString());
    urlSearchParams.set('pageSize', pageSize.toString());
    urlSearchParams.set('searchText', searchText);
    urlSearchParams.set('types[]', type);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/symbol?${urlSearchParams}`);

    expect(findAndCount).toHaveBeenCalledTimes(1);
    expect(findAndCount).toHaveBeenNthCalledWith(1, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: [
        {
          systemId,
          name: ILike(`%${searchText}%`),
          type: In([
            type
          ])
        },
        {
          systemId,
          description: ILike(`%${searchText}%`),
          type: In([
            type
          ])
        },
        {
          systemId,
          type: In([
            type
          ]),
          content: ILike(`%${searchText}%`)
        }
      ]
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      results: [
        instanceToPlain(symbol)
      ],
      total
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql query symbols', async (): Promise<void> => {
    const page = 2;
    const pageSize = 20;
    const searchText = 't S';
    const total = 1;
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const type = SymbolType.variable;
    const symbol = validatePayload({
      id: '7bde3313-f751-42f0-8d89-88c4ab394282',
      systemId,
      name: 'TestSymbol1',
      description: 'Test Symbol 1',
      type,
      content: '\\alpha'
    }, SymbolEntity);

    findAndCount.mockResolvedValueOnce([[
      symbol
    ], total]);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!, $filters: SearchSymbolsPayload!) { symbols(systemId: $systemId, filters: $filters) { results { id systemId name description type content } total } }',
      variables: {
        systemId,
        filters: {
          page,
          pageSize,
          searchText,
          types: [
            type
          ]
        }
      }
    });

    expect(findAndCount).toHaveBeenCalledTimes(1);
    expect(findAndCount).toHaveBeenNthCalledWith(1, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: [
        {
          systemId,
          name: ILike(`%${searchText}%`),
          type: In([
            type
          ])
        },
        {
          systemId,
          description: ILike(`%${searchText}%`),
          type: In([
            type
          ])
        },
        {
          systemId,
          type: In([
            type
          ]),
          content: ILike(`%${searchText}%`)
        }
      ]
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        symbols: {
          results: [
            instanceToPlain(symbol)
          ],
          total
        }
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
