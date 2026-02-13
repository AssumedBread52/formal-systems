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

describe('Update Symbol', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('PATCH /system/:systemId/symbol/:symbolId', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test1';
    const lastName = 'User1';
    const email = 'test1.user1@example.com';
    const hashedPassword = hashSync('TestUser1!');
    const systemCount = 1;
    const constantSymbolCount = 6;
    const variableSymbolCount = 4;
    const axiomCount = 6;
    const theoremCount = 1;
    const deductionCount = 3;
    const proofCount = 6;
    const updatedVariableSymbolCount = variableSymbolCount - 1;
    const updatedConstantSymbolCount = constantSymbolCount + 1;
    const systemId = new ObjectId();
    const title = 'TestSystem1';
    const description = 'Test System 1';
    const symbolId = new ObjectId();
    const newTitle = 'TestSymbol2';
    const newDescription = 'Test Symbol 2';
    const newType = SymbolType.constant;
    const newContent = '\\beta';
    const user = new MongoUserEntity();
    const updatedUser = new MongoUserEntity();
    const system = new MongoSystemEntity();
    const updatedSystem = new MongoSystemEntity();
    const symbol = new MongoSymbolEntity();
    const updatedSymbol = new MongoSymbolEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashedPassword;
    user.systemCount = systemCount;
    user.constantSymbolCount = constantSymbolCount;
    user.variableSymbolCount = variableSymbolCount;
    user.axiomCount = axiomCount;
    user.theoremCount = theoremCount;
    user.deductionCount = deductionCount;
    user.proofCount = proofCount;
    updatedUser._id = userId;
    updatedUser.firstName = firstName;
    updatedUser.lastName = lastName;
    updatedUser.email = email;
    updatedUser.hashedPassword = hashedPassword;
    updatedUser.systemCount = systemCount;
    updatedUser.constantSymbolCount = updatedConstantSymbolCount;
    updatedUser.variableSymbolCount = updatedVariableSymbolCount;
    updatedUser.axiomCount = axiomCount;
    updatedUser.theoremCount = theoremCount;
    updatedUser.deductionCount = deductionCount;
    updatedUser.proofCount = proofCount;
    system._id = systemId;
    system.title = title;
    system.description = description;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.axiomCount = axiomCount;
    system.theoremCount = theoremCount;
    system.deductionCount = deductionCount;
    system.proofCount = proofCount;
    system.createdByUserId = userId;
    updatedSystem._id = systemId;
    updatedSystem.title = title;
    updatedSystem.description = description;
    updatedSystem.constantSymbolCount = updatedConstantSymbolCount;
    updatedSystem.variableSymbolCount = updatedVariableSymbolCount;
    updatedSystem.axiomCount = axiomCount;
    updatedSystem.theoremCount = theoremCount;
    updatedSystem.deductionCount = deductionCount;
    updatedSystem.proofCount = proofCount;
    updatedSystem.createdByUserId = userId;
    symbol._id = symbolId;
    symbol.title = 'TestSymbol1';
    symbol.description = 'Test Symbol 1';
    symbol.type = SymbolType.variable;
    symbol.content = '\\alpha';
    symbol.systemId = systemId;
    symbol.createdByUserId = userId;
    updatedSymbol._id = symbolId;
    updatedSymbol.title = newTitle;
    updatedSymbol.description = newDescription;
    updatedSymbol.type = newType;
    updatedSymbol.content = newContent;
    updatedSymbol.systemId = systemId;
    updatedSymbol.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);
    findOneBy.mockResolvedValueOnce(null);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    save.mockResolvedValueOnce(updatedSymbol);
    save.mockResolvedValueOnce(updatedUser);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription,
      newType,
      newContent
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(5);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: symbolId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      title: newTitle,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(5, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(3);
    expect(save).toHaveBeenNthCalledWith(1, updatedSymbol);
    expect(save).toHaveBeenNthCalledWith(2, updatedUser);
    expect(save).toHaveBeenNthCalledWith(3, updatedSystem);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      id: symbolId.toString(),
      title: newTitle,
      description: newDescription,
      type: newType,
      content: newContent,
      axiomAppearanceCount: 0,
      theoremAppearanceCount: 0,
      deductionAppearanceCount: 0,
      proofAppearanceCount: 0,
      systemId: systemId.toString(),
      createdByUserId: userId.toString()
    });
  });

  it('POST /graphql mutation updateSymbol', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test1';
    const lastName = 'User1';
    const email = 'test1.user1@example.com';
    const hashedPassword = hashSync('TestUser1!');
    const systemCount = 1;
    const constantSymbolCount = 6;
    const variableSymbolCount = 4;
    const axiomCount = 6;
    const theoremCount = 1;
    const deductionCount = 3;
    const proofCount = 6;
    const updatedVariableSymbolCount = variableSymbolCount - 1;
    const updatedConstantSymbolCount = constantSymbolCount + 1;
    const systemId = new ObjectId();
    const title = 'TestSystem1';
    const description = 'Test System 1';
    const symbolId = new ObjectId();
    const newTitle = 'TestSymbol2';
    const newDescription = 'Test Symbol 2';
    const newType = SymbolType.constant;
    const newContent = '\\beta';
    const user = new MongoUserEntity();
    const updatedUser = new MongoUserEntity();
    const system = new MongoSystemEntity();
    const updatedSystem = new MongoSystemEntity();
    const symbol = new MongoSymbolEntity();
    const updatedSymbol = new MongoSymbolEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashedPassword;
    user.systemCount = systemCount;
    user.constantSymbolCount = constantSymbolCount;
    user.variableSymbolCount = variableSymbolCount;
    user.axiomCount = axiomCount;
    user.theoremCount = theoremCount;
    user.deductionCount = deductionCount;
    user.proofCount = proofCount;
    updatedUser._id = userId;
    updatedUser.firstName = firstName;
    updatedUser.lastName = lastName;
    updatedUser.email = email;
    updatedUser.hashedPassword = hashedPassword;
    updatedUser.systemCount = systemCount;
    updatedUser.constantSymbolCount = updatedConstantSymbolCount;
    updatedUser.variableSymbolCount = updatedVariableSymbolCount;
    updatedUser.axiomCount = axiomCount;
    updatedUser.theoremCount = theoremCount;
    updatedUser.deductionCount = deductionCount;
    updatedUser.proofCount = proofCount;
    system._id = systemId;
    system.title = title;
    system.description = description;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.axiomCount = axiomCount;
    system.theoremCount = theoremCount;
    system.deductionCount = deductionCount;
    system.proofCount = proofCount;
    system.createdByUserId = userId;
    updatedSystem._id = systemId;
    updatedSystem.title = title;
    updatedSystem.description = description;
    updatedSystem.constantSymbolCount = updatedConstantSymbolCount;
    updatedSystem.variableSymbolCount = updatedVariableSymbolCount;
    updatedSystem.axiomCount = axiomCount;
    updatedSystem.theoremCount = theoremCount;
    updatedSystem.deductionCount = deductionCount;
    updatedSystem.proofCount = proofCount;
    updatedSystem.createdByUserId = userId;
    symbol._id = symbolId;
    symbol.title = 'TestSymbol1';
    symbol.description = 'Test Symbol 1';
    symbol.type = SymbolType.variable;
    symbol.content = '\\alpha';
    symbol.systemId = systemId;
    symbol.createdByUserId = userId;
    updatedSymbol._id = symbolId;
    updatedSymbol.title = newTitle;
    updatedSymbol.description = newDescription;
    updatedSymbol.type = newType;
    updatedSymbol.content = newContent;
    updatedSymbol.systemId = systemId;
    updatedSymbol.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);
    findOneBy.mockResolvedValueOnce(null);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    save.mockResolvedValueOnce(updatedSymbol);
    save.mockResolvedValueOnce(updatedUser);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation updateSymbol($systemId: String!, $symbolId: String!, $symbolPayload: EditSymbolPayload!) { updateSymbol(systemId: $systemId, symbolId: $symbolId, symbolPayload: $symbolPayload) { id title description type content axiomAppearanceCount theoremAppearanceCount deductionAppearanceCount proofAppearanceCount systemId createdByUserId } }',
      variables: {
        systemId,
        symbolId,
        symbolPayload: {
          newTitle,
          newDescription,
          newType,
          newContent
        }
      }
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(5);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: symbolId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      title: newTitle,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(5, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(3);
    expect(save).toHaveBeenNthCalledWith(1, updatedSymbol);
    expect(save).toHaveBeenNthCalledWith(2, updatedUser);
    expect(save).toHaveBeenNthCalledWith(3, updatedSystem);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        updateSymbol: {
          id: symbolId.toString(),
          title: newTitle,
          description: newDescription,
          type: newType,
          content: newContent,
          axiomAppearanceCount: 0,
          theoremAppearanceCount: 0,
          deductionAppearanceCount: 0,
          proofAppearanceCount: 0,
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
