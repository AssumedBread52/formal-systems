import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';

describe('Read Hypothesis by ID', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/statement/:statementId/hypothesis/:hypothesisId', async (): Promise<void> => {
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const hypothesisId = '72b9158b-bba0-46c7-b898-5e80a64d1ed4';
    const hypothesis = validatePayload({
      id: hypothesisId,
      systemId,
      statementId,
      expressionId: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      type: HypothesisType.type
    }, HypothesisEntity);

    findOneBy.mockResolvedValueOnce(hypothesis);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/statement/${statementId}/hypothesis/${hypothesisId}`);

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: hypothesisId,
      systemId,
      statementId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual(instanceToPlain(hypothesis));
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql query hypothesis', async (): Promise<void> => {
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const hypothesisId = '72b9158b-bba0-46c7-b898-5e80a64d1ed4';
    const hypothesis = validatePayload({
      id: hypothesisId,
      systemId,
      statementId,
      expressionId: 'cfe59823-eb13-4faf-a90b-c5e82022821f',
      type: HypothesisType.type
    }, HypothesisEntity);

    findOneBy.mockResolvedValueOnce(hypothesis);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!, $statementId: String!, $hypothesisId: String!) { hypothesis(systemId: $systemId, statementId: $statementId, hypothesisId: $hypothesisId) { id systemId statementId expressionId type } }',
      variables: {
        systemId,
        statementId,
        hypothesisId
      }
    });

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: hypothesisId,
      systemId,
      statementId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        hypothesis: instanceToPlain(hypothesis)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
