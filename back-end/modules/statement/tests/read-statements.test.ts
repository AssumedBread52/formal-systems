import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { ILike } from 'typeorm';

describe('Read Statements', (): void => {
  const findAndCount = findAndCountMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/statement', async (): Promise<void> => {
    const page = 2;
    const pageSize = 20;
    const searchText = 't S';
    const total = 21;
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statement = validatePayload({
      id: '9df17e91-7e96-40b6-a455-c57148d7c92b',
      systemId,
      assertionExpressionId: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      name: 'TestStatement1',
      description: 'Test Statement 1'
    }, StatementEntity);

    findAndCount.mockResolvedValueOnce([[
      statement
    ], total]);

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('page', page.toString());
    urlSearchParams.set('pageSize', pageSize.toString());
    urlSearchParams.set('searchText', searchText);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/statement?${urlSearchParams}`);

    expect(findAndCount).toHaveBeenCalledTimes(1);
    expect(findAndCount).toHaveBeenNthCalledWith(1, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: [
        {
          systemId,
          name: ILike(`%${searchText}%`)
        },
        {
          systemId,
          description: ILike(`%${searchText}%`)
        }
      ]
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      results: [
        instanceToPlain(statement)
      ],
      total
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql query statements', async (): Promise<void> => {
    const page = 2;
    const pageSize = 20;
    const searchText = 't S';
    const total = 21;
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statement = validatePayload({
      id: '9df17e91-7e96-40b6-a455-c57148d7c92b',
      systemId,
      assertionExpressionId: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      name: 'TestStatement1',
      description: 'Test Statement 1'
    }, StatementEntity);

    findAndCount.mockResolvedValueOnce([[
      statement
    ], total]);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!, $filters: SearchStatementsPayload!) { statements(systemId: $systemId, filters: $filters) { results { id systemId assertionExpressionId name description } total } }',
      variables: {
        systemId,
        filters: {
          page,
          pageSize,
          searchText
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
          name: ILike(`%${searchText}%`)
        },
        {
          systemId,
          description: ILike(`%${searchText}%`)
        }
      ]
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        statements: {
          results: [
            instanceToPlain(statement)
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
