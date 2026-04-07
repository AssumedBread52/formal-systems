import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { existsByMock } from '@/common/tests/mocks/exists-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';

describe('Update Symbol', (): void => {
  const existsBy = existsByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('PATCH /system/:systemId/symbol/:symbolId', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const symbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const newName = 'NewTestSymbol1';
    const newDescription = 'New Test Symbol 1';
    const newType = SymbolType.constant;
    const newContent = '\\vdash';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const system = validatePayload({
      id: systemId,
      ownerUserId: userId,
      name: 'TestSystem1',
      description: 'Test System 1'
    }, SystemEntity);
    const symbol = validatePayload({
      id: symbolId,
      systemId,
      name: 'TestSymbol1',
      description: 'Test Symbol 1',
      type: SymbolType.variable,
      content: '\\alpha'
    }, SymbolEntity);
    const updatedSymbol = validatePayload({
      id: symbolId,
      systemId,
      name: newName,
      description: newDescription,
      type: newType,
      content: newContent
    }, SymbolEntity);

    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    save.mockResolvedValueOnce(updatedSymbol);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newName,
      newDescription,
      newType,
      newContent
    });

    expect(existsBy).toHaveBeenCalledTimes(1);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      systemId,
      name: newName
    });
    expect(findOneBy).toHaveBeenCalledTimes(4);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: symbolId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, updatedSymbol);
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql mutation updateSymbol', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const symbolId = '7bde3313-f751-42f0-8d89-88c4ab394282';
    const newName = 'NewTestSymbol1';
    const newDescription = 'New Test Symbol 1';
    const newType = SymbolType.constant;
    const newContent = '\\vdash';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const system = validatePayload({
      id: systemId,
      ownerUserId: userId,
      name: 'TestSystem1',
      description: 'Test System 1'
    }, SystemEntity);
    const symbol = validatePayload({
      id: symbolId,
      systemId,
      name: 'TestSymbol1',
      description: 'Test Symbol 1',
      type: SymbolType.variable,
      content: '\\alpha'
    }, SymbolEntity);
    const updatedSymbol = validatePayload({
      id: symbolId,
      systemId,
      name: newName,
      description: newDescription,
      type: newType,
      content: newContent
    }, SymbolEntity);

    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
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
          newName,
          newDescription,
          newType,
          newContent
        }
      }
    });

    expect(existsBy).toHaveBeenCalledTimes(1);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      systemId,
      name: newName
    });
    expect(findOneBy).toHaveBeenCalledTimes(4);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      id: symbolId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, updatedSymbol);
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
