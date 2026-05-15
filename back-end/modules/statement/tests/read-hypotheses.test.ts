import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { In } from 'typeorm';

describe('Read Hypotheses', (): void => {
  const findAndCount = findAndCountMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/statement/:statementId/hypothesis', async (): Promise<void> => {
    const page = 2;
    const pageSize = 20;
    const type = HypothesisType.type;
    const total = 21;
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const hypothesis = validatePayload({
      id: '72b9158b-bba0-46c7-b898-5e80a64d1ed4',
      systemId,
      statementId,
      expressionId: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      type
    }, HypothesisEntity);

    findAndCount.mockResolvedValueOnce([[
      hypothesis
    ], total]);

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('page', page.toString());
    urlSearchParams.set('pageSize', pageSize.toString());
    urlSearchParams.append('types[]', type);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/statement/${statementId}/hypothesis?${urlSearchParams}`);

    expect(findAndCount).toHaveBeenCalledTimes(1);
    expect(findAndCount).toHaveBeenNthCalledWith(1, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: {
        systemId,
        statementId,
        type: In([
          type
        ])
      }
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      results: [
        instanceToPlain(hypothesis)
      ],
      total
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql query hypotheses', async (): Promise<void> => {
    const page = 2;
    const pageSize = 20;
    const type = HypothesisType.type;
    const total = 21;
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const hypothesis = validatePayload({
      id: '72b9158b-bba0-46c7-b898-5e80a64d1ed4',
      systemId,
      statementId,
      expressionId: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      type
    }, HypothesisEntity);

    findAndCount.mockResolvedValueOnce([[
      hypothesis
    ], total]);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!, $statementId: String!, $filters: SearchHypothesesPayload!) { hypotheses(systemId: $systemId, statementId: $statementId, filters: $filters) { results { id systemId statementId expressionId type } total } }',
      variables: {
        systemId,
        statementId,
        filters: {
          page,
          pageSize,
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
      where: {
        systemId,
        statementId,
        type: In([
          type
        ])
      }
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        hypotheses: {
          results: [
            instanceToPlain(hypothesis)
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
