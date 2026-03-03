import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { findMock } from '@/common/tests/mocks/find.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { removeMock } from '@/common/tests/mocks/remove.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { MongoExpressionEntity } from '@/expression/entities/mongo-expression.entity';
import { ExpressionType } from '@/expression/enums/expression-type.enum';
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

describe('Delete Expression', (): void => {
  const find = findMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const remove = removeMock();
  const save = saveMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('DELETE /system/:systemId/expression/:expressionId', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test1';
    const lastName = 'User1';
    const email = 'test1.user1@example.com';
    const hashedPassword = hashSync('TestUser1!');
    const systemCount = 1;
    const constantSymbolCount = 10;
    const variableSymbolCount = 6;
    const distinctVariablePairCount = 1;
    const constantVariablePairExpressionCount = 5;
    const constantPrefixedExpressionCount = 25;
    const standardExpressionCount = 125;
    const updatedConstantVariablePairExpressionCount = constantVariablePairExpressionCount - 1;
    const systemId = new ObjectId();
    const title = 'TestSystem1';
    const description = 'Test System 1';
    const firstSymbolId = new ObjectId();
    const firstTitle = 'FirstSymbol';
    const firstDescription = 'First Symbol';
    const firstType = SymbolType.constant;
    const firstContent = 'first';
    const firstDistinctVariablePairAppearanceCount = 0;
    const firstConstantVariablePairExpressionAppearanceCount = 5;
    const firstConstantPrefixedExpressionAppearanceCount = 25;
    const firstStandardExpressionAppearanceCount = 125;
    const updatedFirstConstantVariablePairExpressionAppearanceCount = 4;
    const secondSymbolId = new ObjectId();
    const secondTitle = 'SecondSymbol';
    const secondDescription = 'Second Symbol';
    const secondType = SymbolType.variable;
    const secondContent = 'second';
    const secondDistinctVariablePairAppearanceCount = 1;
    const secondConstantVariablePairExpressionAppearanceCount = 5;
    const secondConstantPrefixedExpressionAppearanceCount = 25;
    const secondStandardExpressionAppearanceCount = 125;
    const updatedSecondConstantVariablePairExpressionAppearanceCount = 4;
    const expressionId = new ObjectId();
    const type = ExpressionType.constant_variable_pair;
    const user = new MongoUserEntity();
    const updatedUser = new MongoUserEntity();
    const system = new MongoSystemEntity();
    const updatedSystem = new MongoSystemEntity();
    const firstSymbol = new MongoSymbolEntity();
    const updatedFirstSymbol = new MongoSymbolEntity();
    const secondSymbol = new MongoSymbolEntity();
    const updatedSecondSymbol = new MongoSymbolEntity();
    const expression = new MongoExpressionEntity();

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
    updatedUser.variableSymbolCount = variableSymbolCount;
    updatedUser.distinctVariablePairCount = distinctVariablePairCount;
    updatedUser.constantVariablePairExpressionCount = updatedConstantVariablePairExpressionCount;
    updatedUser.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    updatedUser.standardExpressionCount = standardExpressionCount;
    system._id = systemId;
    system.title = title;
    system.description = description;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.distinctVariablePairCount = distinctVariablePairCount;
    system.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    system.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    system.standardExpressionCount = standardExpressionCount;
    system.createdByUserId = userId;
    updatedSystem._id = systemId;
    updatedSystem.title = title;
    updatedSystem.description = description;
    updatedSystem.constantSymbolCount = constantSymbolCount;
    updatedSystem.variableSymbolCount = variableSymbolCount;
    updatedSystem.distinctVariablePairCount = distinctVariablePairCount;
    updatedSystem.constantVariablePairExpressionCount = updatedConstantVariablePairExpressionCount;
    updatedSystem.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    updatedSystem.standardExpressionCount = standardExpressionCount;
    updatedSystem.createdByUserId = userId;
    firstSymbol._id = firstSymbolId;
    firstSymbol.title = firstTitle;
    firstSymbol.description = firstDescription;
    firstSymbol.type = firstType;
    firstSymbol.content = firstContent;
    firstSymbol.distinctVariablePairAppearanceCount = firstDistinctVariablePairAppearanceCount;
    firstSymbol.constantVariablePairExpressionAppearanceCount = firstConstantVariablePairExpressionAppearanceCount;
    firstSymbol.constantPrefixedExpressionAppearanceCount = firstConstantPrefixedExpressionAppearanceCount;
    firstSymbol.standardExpressionAppearanceCount = firstStandardExpressionAppearanceCount;
    firstSymbol.systemId = systemId;
    firstSymbol.createdByUserId = userId;
    updatedFirstSymbol._id = firstSymbolId;
    updatedFirstSymbol.title = firstTitle;
    updatedFirstSymbol.description = firstDescription;
    updatedFirstSymbol.type = firstType;
    updatedFirstSymbol.content = firstContent;
    updatedFirstSymbol.distinctVariablePairAppearanceCount = firstDistinctVariablePairAppearanceCount;
    updatedFirstSymbol.constantVariablePairExpressionAppearanceCount = updatedFirstConstantVariablePairExpressionAppearanceCount;
    updatedFirstSymbol.constantPrefixedExpressionAppearanceCount = firstConstantPrefixedExpressionAppearanceCount;
    updatedFirstSymbol.standardExpressionAppearanceCount = firstStandardExpressionAppearanceCount;
    updatedFirstSymbol.systemId = systemId;
    updatedFirstSymbol.createdByUserId = userId;
    secondSymbol._id = secondSymbolId;
    secondSymbol.title = secondTitle;
    secondSymbol.description = secondDescription;
    secondSymbol.type = secondType;
    secondSymbol.content = secondContent;
    secondSymbol.distinctVariablePairAppearanceCount = secondDistinctVariablePairAppearanceCount;
    secondSymbol.constantVariablePairExpressionAppearanceCount = secondConstantVariablePairExpressionAppearanceCount;
    secondSymbol.constantPrefixedExpressionAppearanceCount = secondConstantPrefixedExpressionAppearanceCount;
    secondSymbol.standardExpressionAppearanceCount = secondStandardExpressionAppearanceCount;
    secondSymbol.systemId = systemId;
    secondSymbol.createdByUserId = userId;
    updatedSecondSymbol._id = secondSymbolId;
    updatedSecondSymbol.title = secondTitle;
    updatedSecondSymbol.description = secondDescription;
    updatedSecondSymbol.type = secondType;
    updatedSecondSymbol.content = secondContent;
    updatedSecondSymbol.distinctVariablePairAppearanceCount = secondDistinctVariablePairAppearanceCount;
    updatedSecondSymbol.constantVariablePairExpressionAppearanceCount = updatedSecondConstantVariablePairExpressionAppearanceCount;
    updatedSecondSymbol.constantPrefixedExpressionAppearanceCount = secondConstantPrefixedExpressionAppearanceCount;
    updatedSecondSymbol.standardExpressionAppearanceCount = secondStandardExpressionAppearanceCount;
    updatedSecondSymbol.systemId = systemId;
    updatedSecondSymbol.createdByUserId = userId;
    expression._id = expressionId;
    expression.symbolIds = [firstSymbolId, secondSymbolId];
    expression.type = type;
    expression.systemId = systemId;
    expression.createdByUserId = userId;

    find.mockResolvedValueOnce([
      firstSymbol,
      secondSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(expression);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    remove.mockResolvedValueOnce(expression);
    save.mockResolvedValueOnce(updatedUser);
    save.mockResolvedValueOnce(updatedFirstSymbol);
    save.mockResolvedValueOnce(updatedSecondSymbol);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/expression/${expressionId}`).set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      _id: {
        $in: [
          firstSymbolId,
          secondSymbolId
        ]
      },
      systemId
    });
    expect(findOneBy).toHaveBeenCalledTimes(5);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: expressionId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(5, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenNthCalledWith(1, expression);
    expect(save).toHaveBeenCalledTimes(4);
    expect(save).toHaveBeenNthCalledWith(1, updatedUser);
    expect(save).toHaveBeenNthCalledWith(2, updatedFirstSymbol);
    expect(save).toHaveBeenNthCalledWith(3, updatedSecondSymbol);
    expect(save).toHaveBeenNthCalledWith(4, updatedSystem);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      id: expressionId.toString(),
      symbolIds: [
        firstSymbolId.toString(),
        secondSymbolId.toString()
      ],
      type,
      systemId: systemId.toString(),
      createdByUserId: userId.toString()
    });
  });

  it('POST /graphql mutation deleteExpression', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test1';
    const lastName = 'User1';
    const email = 'test1.user1@example.com';
    const hashedPassword = hashSync('TestUser1!');
    const systemCount = 1;
    const constantSymbolCount = 10;
    const variableSymbolCount = 6;
    const distinctVariablePairCount = 1;
    const constantVariablePairExpressionCount = 5;
    const constantPrefixedExpressionCount = 25;
    const standardExpressionCount = 125;
    const updatedConstantVariablePairExpressionCount = constantVariablePairExpressionCount - 1;
    const systemId = new ObjectId();
    const title = 'TestSystem1';
    const description = 'Test System 1';
    const firstSymbolId = new ObjectId();
    const firstTitle = 'FirstSymbol';
    const firstDescription = 'First Symbol';
    const firstType = SymbolType.constant;
    const firstContent = 'first';
    const firstDistinctVariablePairAppearanceCount = 0;
    const firstConstantVariablePairExpressionAppearanceCount = 5;
    const firstConstantPrefixedExpressionAppearanceCount = 25;
    const firstStandardExpressionAppearanceCount = 125;
    const updatedFirstConstantVariablePairExpressionAppearanceCount = 4;
    const secondSymbolId = new ObjectId();
    const secondTitle = 'SecondSymbol';
    const secondDescription = 'Second Symbol';
    const secondType = SymbolType.variable;
    const secondContent = 'second';
    const secondDistinctVariablePairAppearanceCount = 1;
    const secondConstantVariablePairExpressionAppearanceCount = 5;
    const secondConstantPrefixedExpressionAppearanceCount = 25;
    const secondStandardExpressionAppearanceCount = 125;
    const updatedSecondConstantVariablePairExpressionAppearanceCount = 4;
    const expressionId = new ObjectId();
    const type = ExpressionType.constant_variable_pair;
    const user = new MongoUserEntity();
    const updatedUser = new MongoUserEntity();
    const system = new MongoSystemEntity();
    const updatedSystem = new MongoSystemEntity();
    const firstSymbol = new MongoSymbolEntity();
    const updatedFirstSymbol = new MongoSymbolEntity();
    const secondSymbol = new MongoSymbolEntity();
    const updatedSecondSymbol = new MongoSymbolEntity();
    const expression = new MongoExpressionEntity();

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
    updatedUser.variableSymbolCount = variableSymbolCount;
    updatedUser.distinctVariablePairCount = distinctVariablePairCount;
    updatedUser.constantVariablePairExpressionCount = updatedConstantVariablePairExpressionCount;
    updatedUser.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    updatedUser.standardExpressionCount = standardExpressionCount;
    system._id = systemId;
    system.title = title;
    system.description = description;
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.distinctVariablePairCount = distinctVariablePairCount;
    system.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    system.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    system.standardExpressionCount = standardExpressionCount;
    system.createdByUserId = userId;
    updatedSystem._id = systemId;
    updatedSystem.title = title;
    updatedSystem.description = description;
    updatedSystem.constantSymbolCount = constantSymbolCount;
    updatedSystem.variableSymbolCount = variableSymbolCount;
    updatedSystem.distinctVariablePairCount = distinctVariablePairCount;
    updatedSystem.constantVariablePairExpressionCount = updatedConstantVariablePairExpressionCount;
    updatedSystem.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    updatedSystem.standardExpressionCount = standardExpressionCount;
    updatedSystem.createdByUserId = userId;
    firstSymbol._id = firstSymbolId;
    firstSymbol.title = firstTitle;
    firstSymbol.description = firstDescription;
    firstSymbol.type = firstType;
    firstSymbol.content = firstContent;
    firstSymbol.distinctVariablePairAppearanceCount = firstDistinctVariablePairAppearanceCount;
    firstSymbol.constantVariablePairExpressionAppearanceCount = firstConstantVariablePairExpressionAppearanceCount;
    firstSymbol.constantPrefixedExpressionAppearanceCount = firstConstantPrefixedExpressionAppearanceCount;
    firstSymbol.standardExpressionAppearanceCount = firstStandardExpressionAppearanceCount;
    firstSymbol.systemId = systemId;
    firstSymbol.createdByUserId = userId;
    updatedFirstSymbol._id = firstSymbolId;
    updatedFirstSymbol.title = firstTitle;
    updatedFirstSymbol.description = firstDescription;
    updatedFirstSymbol.type = firstType;
    updatedFirstSymbol.content = firstContent;
    updatedFirstSymbol.distinctVariablePairAppearanceCount = firstDistinctVariablePairAppearanceCount;
    updatedFirstSymbol.constantVariablePairExpressionAppearanceCount = updatedFirstConstantVariablePairExpressionAppearanceCount;
    updatedFirstSymbol.constantPrefixedExpressionAppearanceCount = firstConstantPrefixedExpressionAppearanceCount;
    updatedFirstSymbol.standardExpressionAppearanceCount = firstStandardExpressionAppearanceCount;
    updatedFirstSymbol.systemId = systemId;
    updatedFirstSymbol.createdByUserId = userId;
    secondSymbol._id = secondSymbolId;
    secondSymbol.title = secondTitle;
    secondSymbol.description = secondDescription;
    secondSymbol.type = secondType;
    secondSymbol.content = secondContent;
    secondSymbol.distinctVariablePairAppearanceCount = secondDistinctVariablePairAppearanceCount;
    secondSymbol.constantVariablePairExpressionAppearanceCount = secondConstantVariablePairExpressionAppearanceCount;
    secondSymbol.constantPrefixedExpressionAppearanceCount = secondConstantPrefixedExpressionAppearanceCount;
    secondSymbol.standardExpressionAppearanceCount = secondStandardExpressionAppearanceCount;
    secondSymbol.systemId = systemId;
    secondSymbol.createdByUserId = userId;
    updatedSecondSymbol._id = secondSymbolId;
    updatedSecondSymbol.title = secondTitle;
    updatedSecondSymbol.description = secondDescription;
    updatedSecondSymbol.type = secondType;
    updatedSecondSymbol.content = secondContent;
    updatedSecondSymbol.distinctVariablePairAppearanceCount = secondDistinctVariablePairAppearanceCount;
    updatedSecondSymbol.constantVariablePairExpressionAppearanceCount = updatedSecondConstantVariablePairExpressionAppearanceCount;
    updatedSecondSymbol.constantPrefixedExpressionAppearanceCount = secondConstantPrefixedExpressionAppearanceCount;
    updatedSecondSymbol.standardExpressionAppearanceCount = secondStandardExpressionAppearanceCount;
    updatedSecondSymbol.systemId = systemId;
    updatedSecondSymbol.createdByUserId = userId;
    expression._id = expressionId;
    expression.symbolIds = [firstSymbolId, secondSymbolId];
    expression.type = type;
    expression.systemId = systemId;
    expression.createdByUserId = userId;

    find.mockResolvedValueOnce([
      firstSymbol,
      secondSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(expression);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    remove.mockResolvedValueOnce(expression);
    save.mockResolvedValueOnce(updatedUser);
    save.mockResolvedValueOnce(updatedFirstSymbol);
    save.mockResolvedValueOnce(updatedSecondSymbol);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation deleteExpression($systemId: String!, $expressionId: String!) { deleteExpression(systemId: $systemId, expressionId: $expressionId) { id symbolIds type systemId createdByUserId } }',
      variables: {
        expressionId,
        systemId
      }
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      _id: {
        $in: [
          firstSymbolId,
          secondSymbolId
        ]
      },
      systemId
    });
    expect(findOneBy).toHaveBeenCalledTimes(5);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: expressionId,
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(4, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(5, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenNthCalledWith(1, expression);
    expect(save).toHaveBeenCalledTimes(4);
    expect(save).toHaveBeenNthCalledWith(1, updatedUser);
    expect(save).toHaveBeenNthCalledWith(2, updatedFirstSymbol);
    expect(save).toHaveBeenNthCalledWith(3, updatedSecondSymbol);
    expect(save).toHaveBeenNthCalledWith(4, updatedSystem);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        deleteExpression: {
          id: expressionId.toString(),
          symbolIds: [
            firstSymbolId.toString(),
            secondSymbolId.toString()
          ],
          type,
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
