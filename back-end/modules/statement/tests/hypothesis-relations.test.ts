import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findByMock } from '@/common/tests/mocks/find-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
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

describe('Hypothesis Relations', (): void => {
  const findBy = findByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /graphql query hypothesis', async (): Promise<void> => {
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const expressionId = 'cfe59823-eb13-4faf-a90b-c5e82022821f';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const hypothesisId = '72b9158b-bba0-46c7-b898-5e80a64d1ed4';
    const type = HypothesisType.type;
    const system = validatePayload({
      id: systemId,
      ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
      name: 'TestSystem1',
      description: 'Test System 1'
    }, SystemEntity);
    const expression = validatePayload({
      id: expressionId,
      systemId,
      canonical: [
        '7bde3313-f751-42f0-8d89-88c4ab394282'
      ]
    }, ExpressionEntity);
    const statement = validatePayload({
      id: statementId,
      systemId,
      assertionExpressionId: expressionId,
      name: 'TestStatement1',
      description: 'Test Statement 1'
    }, StatementEntity);
    const hypothesis = validatePayload({
      id: hypothesisId,
      systemId,
      statementId,
      expressionId,
      type
    }, HypothesisEntity);

    findBy.mockResolvedValueOnce([
      statement
    ]);
    findBy.mockResolvedValueOnce([
      expression
    ]);
    findBy.mockResolvedValueOnce([
      system
    ]);
    findOneBy.mockResolvedValueOnce(hypothesis);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!, $statementId: String!, $hypothesisId: String!) { hypothesis(systemId: $systemId, statementId: $statementId, hypothesisId: $hypothesisId) { id systemId statementId expressionId type system { id ownerUserId name description } statement { id systemId assertionExpressionId name description } expression { id systemId canonical } } }',
      variables: {
        systemId,
        statementId,
        hypothesisId
      }
    });

    expect(findBy).toHaveBeenCalledTimes(3);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      id: In([
        statementId
      ])
    });
    expect(findBy).toHaveBeenNthCalledWith(2, {
      id: In([
        expressionId
      ])
    });
    expect(findBy).toHaveBeenNthCalledWith(3, {
      id: In([
        systemId
      ])
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
        hypothesis: {
          id: hypothesisId,
          systemId,
          statementId,
          expressionId,
          type,
          system: instanceToPlain(system),
          statement: instanceToPlain(statement),
          expression: instanceToPlain(expression)
        }
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
