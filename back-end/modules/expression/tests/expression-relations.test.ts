import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findByMock } from '@/common/tests/mocks/find-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { In } from 'typeorm';

describe('Expression Relations', (): void => {
  const findBy = findByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /graphql query expression', async (): Promise<void> => {
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const symbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const expressionId = 'cfe59823-eb13-4faf-a90b-c5e82022821f';
    const canonical = [
      symbolId
    ];
    const system = validatePayload({
      id: systemId,
      ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
      name: 'TestSystem1',
      description: 'Test System 1'
    }, SystemEntity);
    const expression = validatePayload({
      id: expressionId,
      systemId,
      canonical
    }, ExpressionEntity);
    const expressionToken = validatePayload({
      systemId,
      symbolId,
      expressionId,
      position: 0
    }, ExpressionTokenEntity);

    findBy.mockResolvedValueOnce([
      expressionToken
    ]);
    findBy.mockResolvedValueOnce([
      system
    ]);
    findOneBy.mockResolvedValueOnce(expression);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!, $expressionId: String!) { expression(systemId: $systemId, expressionId: $expressionId) { id systemId canonical system { id ownerUserId name description } expressionTokens { systemId symbolId expressionId position } } }',
      variables: {
        systemId,
        expressionId
      }
    });

    expect(findBy).toHaveBeenCalledTimes(2);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      expressionId: In([
        expressionId
      ])
    });
    expect(findBy).toHaveBeenNthCalledWith(2, {
      id: In([
        systemId
      ])
    });
    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: expressionId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        expression: {
          id: expressionId,
          systemId,
          canonical,
          system: instanceToPlain(system),
          expressionTokens: [
            instanceToPlain(expressionToken)
          ]
        }
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
