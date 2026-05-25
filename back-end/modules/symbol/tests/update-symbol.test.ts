import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { existsByMock } from '@/common/tests/mocks/exists-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { getRepositoryMock } from '@/common/tests/mocks/get-repository.mock';
import { managerMock } from '@/common/tests/mocks/manager.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { transactionMock } from '@/common/tests/mocks/transaction.mock';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { IsNull, Not } from 'typeorm';

describe('Update Symbol', (): void => {
  const existsBy = existsByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const getRepository = getRepositoryMock();
  const manager = managerMock();
  const save = saveMock();
  const transaction = transactionMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('PATCH /system/:systemId/symbol/:symbolId', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const symbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const name = 'NewTestSymbol1';
    const description = 'New Test Symbol 1';
    const type = SymbolType.variable;
    const content = '\\vdash';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const symbol = validatePayload({
      id: symbolId,
      systemId,
      name: 'TestSymbol1',
      description: 'Test Symbol 1',
      type: SymbolType.constant,
      content: '\\alpha'
    }, SymbolEntity);
    const updatedSymbol = validatePayload({
      id: symbolId,
      systemId,
      name,
      description,
      type,
      content
    }, SymbolEntity);

    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(false);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);
    save.mockResolvedValueOnce(updatedSymbol);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      name,
      description,
      type,
      content
    });

    expect(existsBy).toHaveBeenCalledTimes(3);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      id: systemId,
      ownerUserId: userId
    });
    expect(existsBy).toHaveBeenNthCalledWith(2, {
      systemId,
      name
    });
    expect(existsBy).toHaveBeenNthCalledWith(3, {
      id: symbolId,
      expressionTokens: {
        expression: [
          {
            statements: {
              id: Not(IsNull())
            }
          },
          {
            hypotheses: {
              id: Not(IsNull())
            }
          }
        ]
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: symbolId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(2);
    expect(getRepository).toHaveBeenNthCalledWith(1, SymbolEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, SymbolEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, updatedSymbol);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual(instanceToPlain(updatedSymbol));
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql mutation updateSymbol', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const symbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const name = 'NewTestSymbol1';
    const description = 'New Test Symbol 1';
    const type = SymbolType.variable;
    const content = '\\vdash';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const symbol = validatePayload({
      id: symbolId,
      systemId,
      name: 'TestSymbol1',
      description: 'Test Symbol 1',
      type: SymbolType.constant,
      content: '\\alpha'
    }, SymbolEntity);
    const updatedSymbol = validatePayload({
      id: symbolId,
      systemId,
      name,
      description,
      type,
      content
    }, SymbolEntity);

    existsBy.mockResolvedValueOnce(true);
    existsBy.mockResolvedValueOnce(false);
    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);
    save.mockResolvedValueOnce(updatedSymbol);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation ($systemId: String!, $symbolId: String!, $symbolPayload: EditSymbolPayload!) { updateSymbol(systemId: $systemId, symbolId: $symbolId, symbolPayload: $symbolPayload) { id systemId name description type content } }',
      variables: {
        systemId,
        symbolId,
        symbolPayload: {
          name,
          description,
          type,
          content
        }
      }
    });

    expect(existsBy).toHaveBeenCalledTimes(3);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      id: systemId,
      ownerUserId: userId
    });
    expect(existsBy).toHaveBeenNthCalledWith(2, {
      systemId,
      name
    });
    expect(existsBy).toHaveBeenNthCalledWith(3, {
      id: symbolId,
      expressionTokens: {
        expression: [
          {
            statements: {
              id: Not(IsNull())
            }
          },
          {
            hypotheses: {
              id: Not(IsNull())
            }
          }
        ]
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: symbolId,
      systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(getRepository).toHaveBeenCalledTimes(2);
    expect(getRepository).toHaveBeenNthCalledWith(1, SymbolEntity);
    expect(getRepository).toHaveBeenNthCalledWith(2, SymbolEntity);
    expect(manager).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, updatedSymbol);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(response.body).toStrictEqual({
      data: {
        updateSymbol: instanceToPlain(updatedSymbol)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
