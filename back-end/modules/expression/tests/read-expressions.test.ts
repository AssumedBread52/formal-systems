import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { ArrayContains } from 'typeorm';

describe('Read Expressions', (): void => {
  const findAndCount = findAndCountMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/expression', async (): Promise<void> => {
    const page = 2;
    const pageSize = 20;
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const symbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const total = 21;
    const expression = validatePayload({
      id: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      systemId,
      canonical: [
        symbolId
      ]
    }, ExpressionEntity);

    findAndCount.mockResolvedValueOnce([[
      expression
    ], total]);

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('page', page.toString());
    urlSearchParams.set('pageSize', pageSize.toString());
    urlSearchParams.append('symbolIds[]', symbolId);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/expression?${urlSearchParams}`);

    expect(findAndCount).toHaveBeenCalledTimes(1);
    expect(findAndCount).toHaveBeenNthCalledWith(1, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: {
        systemId,
        canonical: ArrayContains([
          symbolId
        ])
      }
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      results: [
        instanceToPlain(expression)
      ],
      total
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql query expressions', async (): Promise<void> => {
    const page = 2;
    const pageSize = 20;
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const symbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const total = 21;
    const expression = validatePayload({
      id: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      systemId,
      canonical: [
        symbolId
      ]
    }, ExpressionEntity);

    findAndCount.mockResolvedValueOnce([[
      expression
    ], total]);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!, $filters: SearchExpressionsPayload!) { expressions(systemId: $systemId, filters: $filters) { results { id systemId canonical } total } }',
      variables: {
        systemId,
        filters: {
          page,
          pageSize,
          symbolIds: [
            symbolId
          ]
        }
      }
    });

    expect(findAndCount).toHaveBeenCalledTimes(1);
    expect(findAndCount).toHaveBeenNthCalledWith(1, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: {
        systemId,
        canonical: ArrayContains([
          symbolId
        ])
      }
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        expressions: {
          results: [
            instanceToPlain(expression)
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
