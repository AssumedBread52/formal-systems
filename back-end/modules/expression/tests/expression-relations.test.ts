import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findByMock } from '@/common/tests/mocks/find-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
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
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
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
    const statement = validatePayload({
      id: statementId,
      systemId,
      assertionExpressionId: expressionId,
      name: 'TestStatement1',
      description: 'Test Statement 1'
    }, StatementEntity);
    const hypothesis = validatePayload({
      id: '72b9158b-bba0-46c7-b898-5e80a64d1ed4',
      systemId,
      statementId,
      expressionId,
      type: HypothesisType.type
    }, HypothesisEntity);

    findBy.mockResolvedValueOnce([
      expressionToken
    ]);
    findBy.mockResolvedValueOnce([
      statement
    ]);
    findBy.mockResolvedValueOnce([
      hypothesis
    ]);
    findBy.mockResolvedValueOnce([
      system
    ]);
    findOneBy.mockResolvedValueOnce(expression);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!, $expressionId: String!) { expression(systemId: $systemId, expressionId: $expressionId) { id systemId canonical system { id ownerUserId name description } expressionTokens { systemId symbolId expressionId position } statements { id systemId assertionExpressionId name description } hypotheses { id systemId statementId expressionId type } } }',
      variables: {
        systemId,
        expressionId
      }
    });

    expect(findBy).toHaveBeenCalledTimes(4);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      expressionId: In([
        expressionId
      ])
    });
    expect(findBy).toHaveBeenNthCalledWith(2, {
      assertionExpressionId: In([
        expressionId
      ])
    });
    expect(findBy).toHaveBeenNthCalledWith(3, {
      expressionId: In([
        expressionId
      ])
    });
    expect(findBy).toHaveBeenNthCalledWith(4, {
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
          ],
          statements: [
            instanceToPlain(statement)
          ],
          hypotheses: [
            instanceToPlain(hypothesis)
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
