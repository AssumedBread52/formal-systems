import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { findMock } from '@/common/tests/mocks/find.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
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

describe('Create Expression', (): void => {
  const find = findMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /system/:systemId/expression', async (): Promise<void> => {
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
    const updatedConstantPrefixedExpressionCount = constantPrefixedExpressionCount + 1;
    const systemId = new ObjectId();
    const title = 'TestSystem1';
    const description = 'Test System 1';
    const firstSymbolId = new ObjectId();
    const firstTitle = 'TestSymbol1';
    const firstDescription = 'Test Symbol 1';
    const firstType = SymbolType.constant;
    const firstContent = 'first';
    const firstDistinctVariablePairAppearanceCount = 0;
    const firstConstantVariablePairExpressionAppearanceCount = 5;
    const firstConstantPrefixedExpressionAppearanceCount = 25;
    const firstStandardExpressionAppearanceCount = 125;
    const secondSymbolId = new ObjectId();
    const secondTitle = 'TestSymbol2';
    const secondDescription = 'Test Symbol 2';
    const secondType = SymbolType.variable;
    const secondContent = 'second';
    const secondDistinctVariablePairAppearanceCount = 1;
    const secondConstantVariablePairExpressionAppearanceCount = 5;
    const secondConstantPrefixedExpressionAppearanceCount = 25;
    const secondStandardExpressionAppearanceCount = 125;
    const updatedFirstConstantPrefixedExpressionAppearanceCount = firstConstantPrefixedExpressionAppearanceCount + 1;
    const updatedSecondConstantPrefixedExpressionAppearanceCount = secondConstantPrefixedExpressionAppearanceCount + 1;
    const expressionId = new ObjectId();
    const symboldIds = [
      firstSymbolId,
      secondSymbolId,
      firstSymbolId
    ];
    const type = ExpressionType.constant_prefixed;
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
    updatedUser.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    updatedUser.constantPrefixedExpressionCount = updatedConstantPrefixedExpressionCount;
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
    updatedSystem.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    updatedSystem.constantPrefixedExpressionCount = updatedConstantPrefixedExpressionCount;
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
    updatedFirstSymbol.constantVariablePairExpressionAppearanceCount = firstConstantVariablePairExpressionAppearanceCount;
    updatedFirstSymbol.constantPrefixedExpressionAppearanceCount = updatedFirstConstantPrefixedExpressionAppearanceCount;
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
    updatedSecondSymbol.constantVariablePairExpressionAppearanceCount = secondConstantVariablePairExpressionAppearanceCount;
    updatedSecondSymbol.constantPrefixedExpressionAppearanceCount = updatedSecondConstantPrefixedExpressionAppearanceCount;
    updatedSecondSymbol.standardExpressionAppearanceCount = secondStandardExpressionAppearanceCount;
    updatedSecondSymbol.systemId = systemId;
    updatedSecondSymbol.createdByUserId = userId;
    expression._id = expressionId;
    expression.symbolIds = symboldIds;
    expression.type = type;
    expression.systemId = systemId;
    expression.createdByUserId = userId;

    find.mockResolvedValueOnce([
      firstSymbol,
      secondSymbol
    ]);
    find.mockResolvedValueOnce([
      firstSymbol,
      secondSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(null);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    save.mockResolvedValueOnce(expression);
    save.mockResolvedValueOnce(updatedUser);
    save.mockResolvedValueOnce(updatedFirstSymbol);
    save.mockResolvedValueOnce(updatedSecondSymbol);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post(`/system/${systemId}/expression`).set('Cookie', [
      `token=${token}`
    ]).send({
      symbolIds: [
        firstSymbolId,
        secondSymbolId,
        firstSymbolId
      ]
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(2);
    expect(find).toHaveBeenNthCalledWith(1, {
      _id: {
        $in: [
          firstSymbolId,
          secondSymbolId
        ]
      },
      systemId
    });
    expect(find).toHaveBeenNthCalledWith(2, {
      _id: {
        $in: [
          firstSymbolId,
          secondSymbolId
        ]
      },
      systemId
    });
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
      symbolIds: [
        firstSymbolId,
        secondSymbolId,
        firstSymbolId
      ],
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(5, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(6, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(5);
    expect(save).toHaveBeenNthCalledWith(1, {
      _id: expect.objectContaining(/^[0-9a-f]{24}$/),
      symbolIds: [
        firstSymbolId,
        secondSymbolId,
        firstSymbolId
      ],
      type: ExpressionType.constant_prefixed,
      systemId,
      createdByUserId: userId
    });
    expect(save).toHaveBeenNthCalledWith(2, updatedUser);
    expect(save).toHaveBeenNthCalledWith(3, updatedFirstSymbol);
    expect(save).toHaveBeenNthCalledWith(4, updatedSecondSymbol);
    expect(save).toHaveBeenNthCalledWith(5, updatedSystem);
    expect(statusCode).toBe(HttpStatus.CREATED);
    expect(body).toStrictEqual({
      id: expressionId.toString(),
      symbolIds: [
        firstSymbolId.toString(),
        secondSymbolId.toString(),
        firstSymbolId.toString()
      ],
      type,
      systemId: systemId.toString(),
      createdByUserId: userId.toString()
    });
  });

  it('POST /graphql mutation createExpression', async (): Promise<void> => {
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
    const updatedConstantPrefixedExpressionCount = constantPrefixedExpressionCount + 1;
    const systemId = new ObjectId();
    const title = 'TestSystem1';
    const description = 'Test System 1';
    const firstSymbolId = new ObjectId();
    const firstTitle = 'TestSymbol1';
    const firstDescription = 'Test Symbol 1';
    const firstType = SymbolType.constant;
    const firstContent = 'first';
    const firstDistinctVariablePairAppearanceCount = 0;
    const firstConstantVariablePairExpressionAppearanceCount = 5;
    const firstConstantPrefixedExpressionAppearanceCount = 25;
    const firstStandardExpressionAppearanceCount = 125;
    const secondSymbolId = new ObjectId();
    const secondTitle = 'TestSymbol2';
    const secondDescription = 'Test Symbol 2';
    const secondType = SymbolType.variable;
    const secondContent = 'second';
    const secondDistinctVariablePairAppearanceCount = 1;
    const secondConstantVariablePairExpressionAppearanceCount = 5;
    const secondConstantPrefixedExpressionAppearanceCount = 25;
    const secondStandardExpressionAppearanceCount = 125;
    const updatedFirstConstantPrefixedExpressionAppearanceCount = firstConstantPrefixedExpressionAppearanceCount + 1;
    const updatedSecondConstantPrefixedExpressionAppearanceCount = secondConstantPrefixedExpressionAppearanceCount + 1;
    const expressionId = new ObjectId();
    const symboldIds = [
      firstSymbolId,
      secondSymbolId,
      firstSymbolId
    ];
    const type = ExpressionType.constant_prefixed;
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
    updatedUser.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    updatedUser.constantPrefixedExpressionCount = updatedConstantPrefixedExpressionCount;
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
    updatedSystem.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    updatedSystem.constantPrefixedExpressionCount = updatedConstantPrefixedExpressionCount;
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
    updatedFirstSymbol.constantVariablePairExpressionAppearanceCount = firstConstantVariablePairExpressionAppearanceCount;
    updatedFirstSymbol.constantPrefixedExpressionAppearanceCount = updatedFirstConstantPrefixedExpressionAppearanceCount;
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
    updatedSecondSymbol.constantVariablePairExpressionAppearanceCount = secondConstantVariablePairExpressionAppearanceCount;
    updatedSecondSymbol.constantPrefixedExpressionAppearanceCount = updatedSecondConstantPrefixedExpressionAppearanceCount;
    updatedSecondSymbol.standardExpressionAppearanceCount = secondStandardExpressionAppearanceCount;
    updatedSecondSymbol.systemId = systemId;
    updatedSecondSymbol.createdByUserId = userId;
    expression._id = expressionId;
    expression.symbolIds = symboldIds;
    expression.type = type;
    expression.systemId = systemId;
    expression.createdByUserId = userId;

    find.mockResolvedValueOnce([
      firstSymbol,
      secondSymbol
    ]);
    find.mockResolvedValueOnce([
      firstSymbol,
      secondSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(null);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    save.mockResolvedValueOnce(expression);
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
      query: 'mutation createExpression($systemId: String!, $expressionPayload: NewExpressionPayload!) { createExpression(systemId: $systemId, expressionPayload: $expressionPayload) { id symbolIds type systemId createdByUserId } }',
      variables: {
        expressionPayload: {
          symbolIds: [
            firstSymbolId,
            secondSymbolId,
            firstSymbolId
          ]
        },
        systemId
      }
    });

    const { statusCode, body } = response;

    expect(find).toHaveBeenCalledTimes(2);
    expect(find).toHaveBeenNthCalledWith(1, {
      _id: {
        $in: [
          firstSymbolId,
          secondSymbolId
        ]
      },
      systemId
    });
    expect(find).toHaveBeenNthCalledWith(2, {
      _id: {
        $in: [
          firstSymbolId,
          secondSymbolId
        ]
      },
      systemId
    });
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
      symbolIds: [
        firstSymbolId,
        secondSymbolId,
        firstSymbolId
      ],
      systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(5, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(6, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(5);
    expect(save).toHaveBeenNthCalledWith(1, {
      _id: expect.objectContaining(/^[0-9a-f]{24}$/),
      symbolIds: [
        firstSymbolId,
        secondSymbolId,
        firstSymbolId
      ],
      type: ExpressionType.constant_prefixed,
      systemId,
      createdByUserId: userId
    });
    expect(save).toHaveBeenNthCalledWith(2, updatedUser);
    expect(save).toHaveBeenNthCalledWith(3, updatedFirstSymbol);
    expect(save).toHaveBeenNthCalledWith(4, updatedSecondSymbol);
    expect(save).toHaveBeenNthCalledWith(5, updatedSystem);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        createExpression: {
          id: expressionId.toString(),
          symbolIds: [
            firstSymbolId.toString(),
            secondSymbolId.toString(),
            firstSymbolId.toString()
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
