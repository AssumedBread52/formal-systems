import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findByMock } from '@/common/tests/mocks/find-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { SystemEntity } from '@/system/entities/system.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { In } from 'typeorm';

describe('Statement Relations', (): void => {
  const findBy = findByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /graphql query statement', async (): Promise<void> => {
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const statementId = '9df17e91-7e96-40b6-a455-c57148d7c92b';
    const expressionId = 'cfe59823-eb13-4faf-a90b-c5e82022821f';
    const name = 'TestStatement1';
    const description = 'Test Statement 1';
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
      name,
      description
    }, StatementEntity);

    findBy.mockResolvedValueOnce([
      expression
    ]);
    findBy.mockResolvedValueOnce([
      system
    ]);
    findOneBy.mockResolvedValueOnce(statement);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!, $statementId: String!) { statement(systemId: $systemId, statementId: $statementId) { id systemId assertionExpressionId name description system { id ownerUserId name description } assertion { id systemId canonical } } }',
      variables: {
        systemId,
        statementId
      }
    });

    expect(findBy).toHaveBeenCalledTimes(2);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      id: In([
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
      id: statementId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        statement: {
          id: statementId,
          systemId,
          assertionExpressionId: expressionId,
          name,
          description,
          system: instanceToPlain(system),
          assertion: instanceToPlain(expression)
        }
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
