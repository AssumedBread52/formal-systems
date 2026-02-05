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
    const updatedUser1 = new MongoUserEntity();
    const updatedUser2 = new MongoUserEntity();
    const system = new MongoSystemEntity();
    const updatedSystem1 = new MongoSystemEntity();
    const updatedSystem2 = new MongoSystemEntity();
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
    updatedUser1._id = userId;
    updatedUser1.firstName = firstName;
    updatedUser1.lastName = lastName;
    updatedUser1.email = email;
    updatedUser1.hashedPassword = hashedPassword;
    updatedUser1.systemCount = systemCount;
    updatedUser1.constantSymbolCount = constantSymbolCount;
    updatedUser1.variableSymbolCount = updatedVariableSymbolCount;
    updatedUser1.axiomCount = axiomCount;
    updatedUser1.theoremCount = theoremCount;
    updatedUser1.deductionCount = deductionCount;
    updatedUser1.proofCount = proofCount;
    updatedUser2._id = userId;
    updatedUser2.firstName = firstName;
    updatedUser2.lastName = lastName;
    updatedUser2.email = email;
    updatedUser2.hashedPassword = hashedPassword;
    updatedUser2.systemCount = systemCount;
    updatedUser2.constantSymbolCount = updatedConstantSymbolCount;
    updatedUser2.variableSymbolCount = updatedVariableSymbolCount;
    updatedUser2.axiomCount = axiomCount;
    updatedUser2.theoremCount = theoremCount;
    updatedUser2.deductionCount = deductionCount;
    updatedUser2.proofCount = proofCount;
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
    updatedSystem1._id = systemId;
    updatedSystem1.title = title;
    updatedSystem1.description = description;
    updatedSystem1.constantSymbolCount = constantSymbolCount;
    updatedSystem1.variableSymbolCount = updatedVariableSymbolCount;
    updatedSystem1.axiomCount = axiomCount;
    updatedSystem1.theoremCount = theoremCount;
    updatedSystem1.deductionCount = deductionCount;
    updatedSystem1.proofCount = proofCount;
    updatedSystem1.createdByUserId = userId;
    updatedSystem2._id = systemId;
    updatedSystem2.title = title;
    updatedSystem2.description = description;
    updatedSystem2.constantSymbolCount = updatedConstantSymbolCount;
    updatedSystem2.variableSymbolCount = updatedVariableSymbolCount;
    updatedSystem2.axiomCount = axiomCount;
    updatedSystem2.theoremCount = theoremCount;
    updatedSystem2.deductionCount = deductionCount;
    updatedSystem2.proofCount = proofCount;
    updatedSystem2.createdByUserId = userId;
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
    findOneBy.mockResolvedValueOnce(updatedUser1);
    findOneBy.mockResolvedValueOnce(updatedSystem1);
    save.mockResolvedValueOnce(updatedSymbol);
    save.mockResolvedValueOnce(updatedUser1);
    save.mockResolvedValueOnce(updatedSystem1);
    save.mockResolvedValueOnce(updatedUser2);
    save.mockResolvedValueOnce(updatedSystem2);

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

    expect(findOneBy).toHaveBeenCalledTimes(7);
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
    expect(findOneBy).toHaveBeenNthCalledWith(6, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(7, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(5);
    expect(save).toHaveBeenNthCalledWith(1, updatedSymbol);
    expect(save).toHaveBeenNthCalledWith(2, updatedUser1);
    expect(save).toHaveBeenNthCalledWith(3, updatedSystem1);
    expect(save).toHaveBeenNthCalledWith(4, updatedUser2);
    expect(save).toHaveBeenNthCalledWith(5, updatedSystem2);
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
    const updatedUser1 = new MongoUserEntity();
    const updatedUser2 = new MongoUserEntity();
    const system = new MongoSystemEntity();
    const updatedSystem1 = new MongoSystemEntity();
    const updatedSystem2 = new MongoSystemEntity();
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
    updatedUser1._id = userId;
    updatedUser1.firstName = firstName;
    updatedUser1.lastName = lastName;
    updatedUser1.email = email;
    updatedUser1.hashedPassword = hashedPassword;
    updatedUser1.systemCount = systemCount;
    updatedUser1.constantSymbolCount = constantSymbolCount;
    updatedUser1.variableSymbolCount = updatedVariableSymbolCount;
    updatedUser1.axiomCount = axiomCount;
    updatedUser1.theoremCount = theoremCount;
    updatedUser1.deductionCount = deductionCount;
    updatedUser1.proofCount = proofCount;
    updatedUser2._id = userId;
    updatedUser2.firstName = firstName;
    updatedUser2.lastName = lastName;
    updatedUser2.email = email;
    updatedUser2.hashedPassword = hashedPassword;
    updatedUser2.systemCount = systemCount;
    updatedUser2.constantSymbolCount = updatedConstantSymbolCount;
    updatedUser2.variableSymbolCount = updatedVariableSymbolCount;
    updatedUser2.axiomCount = axiomCount;
    updatedUser2.theoremCount = theoremCount;
    updatedUser2.deductionCount = deductionCount;
    updatedUser2.proofCount = proofCount;
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
    updatedSystem1._id = systemId;
    updatedSystem1.title = title;
    updatedSystem1.description = description;
    updatedSystem1.constantSymbolCount = constantSymbolCount;
    updatedSystem1.variableSymbolCount = updatedVariableSymbolCount;
    updatedSystem1.axiomCount = axiomCount;
    updatedSystem1.theoremCount = theoremCount;
    updatedSystem1.deductionCount = deductionCount;
    updatedSystem1.proofCount = proofCount;
    updatedSystem1.createdByUserId = userId;
    updatedSystem2._id = systemId;
    updatedSystem2.title = title;
    updatedSystem2.description = description;
    updatedSystem2.constantSymbolCount = updatedConstantSymbolCount;
    updatedSystem2.variableSymbolCount = updatedVariableSymbolCount;
    updatedSystem2.axiomCount = axiomCount;
    updatedSystem2.theoremCount = theoremCount;
    updatedSystem2.deductionCount = deductionCount;
    updatedSystem2.proofCount = proofCount;
    updatedSystem2.createdByUserId = userId;
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
    findOneBy.mockResolvedValueOnce(updatedUser1);
    findOneBy.mockResolvedValueOnce(updatedSystem1);
    save.mockResolvedValueOnce(updatedSymbol);
    save.mockResolvedValueOnce(updatedUser1);
    save.mockResolvedValueOnce(updatedSystem1);
    save.mockResolvedValueOnce(updatedUser2);
    save.mockResolvedValueOnce(updatedSystem2);

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

    expect(findOneBy).toHaveBeenCalledTimes(7);
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
    expect(findOneBy).toHaveBeenNthCalledWith(6, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(7, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(5);
    expect(save).toHaveBeenNthCalledWith(1, updatedSymbol);
    expect(save).toHaveBeenNthCalledWith(2, updatedUser1);
    expect(save).toHaveBeenNthCalledWith(3, updatedSystem1);
    expect(save).toHaveBeenNthCalledWith(4, updatedUser2);
    expect(save).toHaveBeenNthCalledWith(5, updatedSystem2);
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
