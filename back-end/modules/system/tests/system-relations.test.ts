import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findByMock } from '@/common/tests/mocks/find-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { In } from 'typeorm';

describe('System Relations', (): void => {
  const findBy = findByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /graphql query system', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const symbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const expressionId = 'cfe59823-eb13-4faf-a90b-c5e82022821f';
    const name = 'TestSystem1';
    const description = 'Test System 1';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const system = validatePayload({
      id: systemId,
      ownerUserId: userId,
      name,
      description
    }, SystemEntity);
    const symbol = validatePayload({
      id: symbolId,
      systemId,
      name: 'TestSymbol1',
      description: 'Test Symbol 1',
      type: SymbolType.variable,
      content: 'test-content'
    }, SymbolEntity);
    const expression = validatePayload({
      id: expressionId,
      systemId,
      canonical: [
        symbolId
      ]
    }, ExpressionEntity);
    const expressionToken = validatePayload({
      systemId,
      symbolId,
      expressionId,
      position: 0
    }, ExpressionTokenEntity);

    findBy.mockResolvedValueOnce([
      symbol
    ]);
    findBy.mockResolvedValueOnce([
      expression
    ]);
    findBy.mockResolvedValueOnce([
      expressionToken
    ]);
    findBy.mockResolvedValueOnce([
      user
    ]);
    findOneBy.mockResolvedValueOnce(system);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!) { system(systemId: $systemId) { id ownerUserId name description owner { id handle email } symbols { id systemId name description type content } expressions { id systemId canonical } expressionTokens { systemId symbolId expressionId position } } }',
      variables: {
        systemId
      }
    });

    expect(findBy).toHaveBeenCalledTimes(4);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      systemId: In([
        systemId
      ])
    });
    expect(findBy).toHaveBeenNthCalledWith(2, {
      systemId: In([
        systemId
      ])
    });
    expect(findBy).toHaveBeenNthCalledWith(3, {
      systemId: In([
        systemId
      ])
    })
    expect(findBy).toHaveBeenNthCalledWith(4, {
      id: In([
        userId
      ])
    });
    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        system: {
          id: systemId,
          ownerUserId: userId,
          name,
          description,
          owner: instanceToPlain(user),
          symbols: [
            instanceToPlain(symbol)
          ],
          expressions: [
            instanceToPlain(expression)
          ],
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
