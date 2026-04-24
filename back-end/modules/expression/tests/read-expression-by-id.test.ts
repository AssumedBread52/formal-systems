import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';

describe('Read Expression by ID', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId/expression/:expressionId', async (): Promise<void> => {
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const expressionId = 'cfe59823-eb13-4faf-a90b-c5e82022821f';
    const expression = validatePayload({
      id: expressionId,
      systemId,
      canonical: [
        '7bde3313-f751-42f0-8d89-88c4ab394282'
      ]
    }, ExpressionEntity);

    findOneBy.mockResolvedValueOnce(expression);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}/expression/${expressionId}`);

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: expressionId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual(instanceToPlain(expression));
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql query expression', async (): Promise<void> => {
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const expressionId = 'cfe59823-eb13-4faf-a90b-c5e82022821f';
    const expression = validatePayload({
      id: expressionId,
      systemId,
      canonical: [
        '7bde3313-f751-42f0-8d89-88c4ab394282'
      ]
    }, ExpressionEntity);

    findOneBy.mockResolvedValueOnce(expression);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!, $expressionId: String!) { expression(systemId: $systemId, expressionId: $expressionId) { id systemId canonical } }',
      variables: {
        systemId,
        expressionId
      }
    });

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: expressionId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        expression: instanceToPlain(expression)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
