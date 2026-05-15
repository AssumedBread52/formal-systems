import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { And, In, Not } from 'typeorm';

describe('Read Distinct Variable Pairs', (): void => {
  const findAndCount = findAndCountMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/statement/:statementId/distinct-variable-pair', async (): Promise<void> => {
    const page = 2;
    const pageSize = 20;
    const total = 21;
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const variableSymbol1Id = '630e5c73-6231-4128-aae6-1d528f6b4de4';
    const excludeSymbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const distinctVariablePair = validatePayload({
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id: 'e8172cec-118f-4185-a405-a6cf46869ee0'
    }, DistinctVariablePairEntity);

    findAndCount.mockResolvedValueOnce([[
      distinctVariablePair
    ], total]);

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('page', page.toString());
    urlSearchParams.set('pageSize', pageSize.toString());
    urlSearchParams.append('includeSymbolIds[]', variableSymbol1Id);
    urlSearchParams.append('excludeSymbolIds[]', excludeSymbolId);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/statement/${statementId}/distinct-variable-pair?${urlSearchParams}`);

    expect(findAndCount).toHaveBeenCalledTimes(1);
    expect(findAndCount).toHaveBeenNthCalledWith(1, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: [
        {
          systemId,
          statementId,
          variableSymbol1Id: And(Not(In([
            excludeSymbolId
          ])), In([
            variableSymbol1Id
          ])),
          variableSymbol2Id: Not(In([
            excludeSymbolId
          ]))
        },
        {
          systemId,
          statementId,
          variableSymbol1Id: Not(In([
            excludeSymbolId
          ])),
          variableSymbol2Id: And(Not(In([
            excludeSymbolId
          ])), In([
            variableSymbol1Id
          ]))
        }
      ]
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      results: [
        instanceToPlain(distinctVariablePair)
      ],
      total
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql query distinctVariablePairs', async (): Promise<void> => {
    const page = 2;
    const pageSize = 20;
    const total = 21;
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const variableSymbol1Id = '630e5c73-6231-4128-aae6-1d528f6b4de4';
    const excludeSymbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const distinctVariablePair = validatePayload({
      systemId,
      statementId,
      variableSymbol1Id,
      variableSymbol2Id: 'e8172cec-118f-4185-a405-a6cf46869ee0'
    }, DistinctVariablePairEntity);

    findAndCount.mockResolvedValueOnce([[
      distinctVariablePair
    ], total]);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!, $statementId: String!, $filters: SearchDistinctVariablePairsPayload!) { distinctVariablePairs(systemId: $systemId, statementId: $statementId, filters: $filters) { results { systemId statementId variableSymbol1Id variableSymbol2Id } total } }',
      variables: {
        systemId,
        statementId,
        filters: {
          page,
          pageSize,
          includeSymbolIds: [
            variableSymbol1Id
          ],
          excludeSymbolIds: [
            excludeSymbolId
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
          statementId,
          variableSymbol1Id: And(Not(In([
            excludeSymbolId
          ])), In([
            variableSymbol1Id
          ])),
          variableSymbol2Id: Not(In([
            excludeSymbolId
          ]))
        },
        {
          systemId,
          statementId,
          variableSymbol1Id: Not(In([
            excludeSymbolId
          ])),
          variableSymbol2Id: And(Not(In([
            excludeSymbolId
          ])), In([
            variableSymbol1Id
          ]))
        }
      ]
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        distinctVariablePairs: {
          results: [
            instanceToPlain(distinctVariablePair)
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
