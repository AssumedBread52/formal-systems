import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { removeMock } from '@/common/tests/mocks/remove.mock';
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

describe('Delete Symbol', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const remove = removeMock();
  const save = saveMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('DELETE /system/:systemId/symbol/:symbolId', async (): Promise<void> => {
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
    updatedUser.constantSymbolCount = constantSymbolCount;
    updatedUser.variableSymbolCount = updatedVariableSymbolCount;
    updatedUser.axiomCount = axiomCount;
    updatedUser.theoremCount = theoremCount;
    updatedUser.deductionCount = deductionCount;
    updatedUser.proofCount = proofCount;
    system._id = systemId;
    system.title = systemTitle;
    system.description = systemDescription;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.axiomCount = axiomCount;
    system.theoremCount = theoremCount;
    system.deductionCount = deductionCount;
    system.proofCount = proofCount;
    system.createdByUserId = userId;
    updatedSystem._id = systemId;
    updatedSystem.title = systemTitle;
    updatedSystem.description = systemDescription;
    updatedSystem.constantSymbolCount = constantSymbolCount;
    updatedSystem.variableSymbolCount = updatedVariableSymbolCount;
    updatedSystem.axiomCount = axiomCount;
    updatedSystem.theoremCount = theoremCount;
    updatedSystem.deductionCount = deductionCount;
    updatedSystem.proofCount = proofCount;
    updatedSystem.createdByUserId = userId;
    symbol._id = symbolId;
    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.systemId = systemId;
    symbol.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    remove.mockResolvedValueOnce(symbol);
    save.mockResolvedValueOnce(updatedUser);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/symbol/${symbolId}`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(4);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: symbolId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenNthCalledWith(1, symbol);
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenNthCalledWith(1, updatedUser);
    expect(save).toHaveBeenNthCalledWith(2, updatedSystem);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      id: symbolId.toString(),
      title,
      description,
      type,
      content,
      axiomAppearanceCount: 0,
      theoremAppearanceCount: 0,
      deductionAppearanceCount: 0,
      proofAppearanceCount: 0,
      systemId: systemId.toString(),
      createdByUserId: userId.toString()
    });
  });

  it('POST /graphql mutation deleteSymbol', async (): Promise<void> => {
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
    updatedUser.constantSymbolCount = constantSymbolCount;
    updatedUser.variableSymbolCount = updatedVariableSymbolCount;
    updatedUser.axiomCount = axiomCount;
    updatedUser.theoremCount = theoremCount;
    updatedUser.deductionCount = deductionCount;
    updatedUser.proofCount = proofCount;
    system._id = systemId;
    system.title = systemTitle;
    system.description = systemDescription;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.axiomCount = axiomCount;
    system.theoremCount = theoremCount;
    system.deductionCount = deductionCount;
    system.proofCount = proofCount;
    system.createdByUserId = userId;
    updatedSystem._id = systemId;
    updatedSystem.title = systemTitle;
    updatedSystem.description = systemDescription;
    updatedSystem.constantSymbolCount = constantSymbolCount;
    updatedSystem.variableSymbolCount = updatedVariableSymbolCount;
    updatedSystem.axiomCount = axiomCount;
    updatedSystem.theoremCount = theoremCount;
    updatedSystem.deductionCount = deductionCount;
    updatedSystem.proofCount = proofCount;
    updatedSystem.createdByUserId = userId;
    symbol._id = symbolId;
    symbol.title = title;
    symbol.description = description;
    symbol.type = type;
    symbol.content = content;
    symbol.systemId = systemId;
    symbol.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(symbol);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    remove.mockResolvedValueOnce(symbol);
    save.mockResolvedValueOnce(updatedUser);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation deleteSymbol($systemId: String!, $symbolId: String!) { deleteSymbol(systemId: $systemId, symbolId: $symbolId) { id title description type content axiomAppearanceCount theoremAppearanceCount deductionAppearanceCount proofAppearanceCount systemId createdByUserId } }',
      variables: {
        systemId,
        symbolId
      }
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(4);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: symbolId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenNthCalledWith(1, symbol);
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenNthCalledWith(1, updatedUser);
    expect(save).toHaveBeenNthCalledWith(2, updatedSystem);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        deleteSymbol: {
          id: symbolId.toString(),
          title,
          description,
          type,
          content,
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
