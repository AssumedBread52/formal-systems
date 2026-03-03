import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { MongoSymbolEntity } from '@/symbol/entities/mongo-symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Create Symbol', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /system/:systemId/symbol', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test1';
    const lastName = 'User1';
    const email = 'test1.user1@example.com';
    const hashedPassword = hashSync('TestUser1!');
    const systemCount = 1;
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const distinctVariablePairCount = 1;
    const constantVariablePairExpressionCount = 5;
    const constantPrefixedExpressionCount = 25;
    const standardExpressionCount = 125;
    const updatedVariableSymbolCount = variableSymbolCount + 1;
    const systemId = new ObjectId();
    const systemTitle = 'TestSystem1';
    const systemDescription = 'Test System 1';
    const symbolId = new ObjectId();
    const title = 'TestSymbol1';
    const description = 'Test Symbol 1';
    const type = SymbolType.variable;
    const content = '\\alpha';
    const user = new MongoUserEntity();
    const updatedUser = new MongoUserEntity();
    const system = new MongoSystemEntity();
    const updatedSystem = new MongoSystemEntity();
    const symbol = new MongoSymbolEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashedPassword;
    user.systemCount = systemCount;
    user.constantSymbolCount = constantSymbolCount;
    user.variableSymbolCount = variableSymbolCount;
    user.distinctVariablePairCount = distinctVariablePairCount;
    user.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    user.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    user.standardExpressionCount = standardExpressionCount;
    updatedUser._id = userId;
    updatedUser.firstName = firstName;
    updatedUser.lastName = lastName;
    updatedUser.email = email;
    updatedUser.hashedPassword = hashedPassword;
    updatedUser.systemCount = systemCount;
    updatedUser.constantSymbolCount = constantSymbolCount;
    updatedUser.variableSymbolCount = updatedVariableSymbolCount;
    updatedUser.distinctVariablePairCount = distinctVariablePairCount;
    updatedUser.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    updatedUser.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    updatedUser.standardExpressionCount = standardExpressionCount;
    system._id = systemId;
    system.title = systemTitle;
    system.description = systemDescription;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.distinctVariablePairCount = distinctVariablePairCount;
    system.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    system.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    system.standardExpressionCount = standardExpressionCount;
    system.createdByUserId = userId;
    updatedSystem._id = systemId;
    updatedSystem.title = systemTitle;
    updatedSystem.description = systemDescription;
    updatedSystem.constantSymbolCount = constantSymbolCount;
    updatedSystem.variableSymbolCount = updatedVariableSymbolCount;
    updatedSystem.distinctVariablePairCount = distinctVariablePairCount;
    updatedSystem.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    updatedSystem.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    updatedSystem.standardExpressionCount = standardExpressionCount;
    updatedSystem.createdByUserId = userId;
    symbol._id = symbolId;
    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.systemId = systemId;
    symbol.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(null);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    save.mockResolvedValueOnce(symbol);
    save.mockResolvedValueOnce(updatedUser);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/symbol`).set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description,
      type,
      content
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(6);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      title,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(5, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(6, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(3);
    expect(save).toHaveBeenNthCalledWith(1, {
      _id: expect.objectContaining(/^[0-9a-f]{24}$/),
      title,
      description,
      type,
      content,
      distinctVariablePairAppearanceCount: 0,
      constantVariablePairExpressionAppearanceCount: 0,
      constantPrefixedExpressionAppearanceCount: 0,
      standardExpressionAppearanceCount: 0,
      systemId,
      createdByUserId: userId
    });
    expect(save).toHaveBeenNthCalledWith(2, updatedUser);
    expect(save).toHaveBeenNthCalledWith(3, updatedSystem);
    expect(statusCode).toBe(HttpStatus.CREATED);
    expect(body).toStrictEqual({
      id: symbolId.toString(),
      title,
      description,
      type,
      content,
      distinctVariablePairAppearanceCount: 0,
      constantVariablePairExpressionAppearanceCount: 0,
      constantPrefixedExpressionAppearanceCount: 0,
      standardExpressionAppearanceCount: 0,
      systemId: systemId.toString(),
      createdByUserId: userId.toString()
    });
  });

  it('POST /graphql mutation createSymbol', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test1';
    const lastName = 'User1';
    const email = 'test1.user1@example.com';
    const hashedPassword = hashSync('TestUser1!');
    const systemCount = 1;
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const distinctVariablePairCount = 1;
    const constantVariablePairExpressionCount = 5;
    const constantPrefixedExpressionCount = 25;
    const standardExpressionCount = 125;
    const updatedVariableSymbolCount = variableSymbolCount + 1;
    const systemId = new ObjectId();
    const systemTitle = 'TestSystem1';
    const systemDescription = 'Test System 1';
    const symbolId = new ObjectId();
    const title = 'TestSymbol1';
    const description = 'Test Symbol 1';
    const type = SymbolType.variable;
    const content = '\\alpha';
    const user = new MongoUserEntity();
    const updatedUser = new MongoUserEntity();
    const system = new MongoSystemEntity();
    const updatedSystem = new MongoSystemEntity();
    const symbol = new MongoSymbolEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashedPassword;
    user.systemCount = systemCount;
    user.constantSymbolCount = constantSymbolCount;
    user.variableSymbolCount = variableSymbolCount;
    user.distinctVariablePairCount = distinctVariablePairCount;
    user.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    user.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    user.standardExpressionCount = standardExpressionCount;
    updatedUser._id = userId;
    updatedUser.firstName = firstName;
    updatedUser.lastName = lastName;
    updatedUser.email = email;
    updatedUser.hashedPassword = hashedPassword;
    updatedUser.systemCount = systemCount;
    updatedUser.constantSymbolCount = constantSymbolCount;
    updatedUser.variableSymbolCount = updatedVariableSymbolCount;
    updatedUser.distinctVariablePairCount = distinctVariablePairCount;
    updatedUser.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    updatedUser.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    updatedUser.standardExpressionCount = standardExpressionCount;
    system._id = systemId;
    system.title = systemTitle;
    system.description = systemDescription;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.distinctVariablePairCount = distinctVariablePairCount;
    system.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    system.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    system.standardExpressionCount = standardExpressionCount;
    system.createdByUserId = userId;
    updatedSystem._id = systemId;
    updatedSystem.title = systemTitle;
    updatedSystem.description = systemDescription;
    updatedSystem.constantSymbolCount = constantSymbolCount;
    updatedSystem.variableSymbolCount = updatedVariableSymbolCount;
    updatedSystem.distinctVariablePairCount = distinctVariablePairCount;
    updatedSystem.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    updatedSystem.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    updatedSystem.standardExpressionCount = standardExpressionCount;
    updatedSystem.createdByUserId = userId;
    symbol._id = symbolId;
    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.systemId = systemId;
    symbol.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(null);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    save.mockResolvedValueOnce(symbol);
    save.mockResolvedValueOnce(updatedUser);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation createSymbol($systemId: String!, $symbolPayload: NewSymbolPayload!) { createSymbol(systemId: $systemId, symbolPayload: $symbolPayload) { id title description type content distinctVariablePairAppearanceCount constantVariablePairExpressionAppearanceCount constantPrefixedExpressionAppearanceCount standardExpressionAppearanceCount systemId createdByUserId } }',
      variables: {
        systemId,
        symbolPayload: {
          title,
          description,
          type,
          content
        }
      }
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(6);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      title,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(5, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(6, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(3);
    expect(save).toHaveBeenNthCalledWith(1, {
      _id: expect.objectContaining(/^[0-9a-f]{24}$/),
      title,
      description,
      type,
      content,
      distinctVariablePairAppearanceCount: 0,
      constantVariablePairExpressionAppearanceCount: 0,
      constantPrefixedExpressionAppearanceCount: 0,
      standardExpressionAppearanceCount: 0,
      systemId,
      createdByUserId: userId
    });
    expect(save).toHaveBeenNthCalledWith(2, updatedUser);
    expect(save).toHaveBeenNthCalledWith(3, updatedSystem);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        createSymbol: {
          id: symbolId.toString(),
          title,
          description,
          type,
          content,
          distinctVariablePairAppearanceCount: 0,
          constantVariablePairExpressionAppearanceCount: 0,
          constantPrefixedExpressionAppearanceCount: 0,
          standardExpressionAppearanceCount: 0,
          systemId: systemId.toString(),
          createdByUserId: userId.toString()
        }
      }
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
