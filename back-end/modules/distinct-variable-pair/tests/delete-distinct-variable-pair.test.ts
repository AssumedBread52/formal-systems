import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { findMock } from '@/common/tests/mocks/find.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { removeMock } from '@/common/tests/mocks/remove.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { MongoDistinctVariablePairEntity } from '@/distinct-variable-pair/entities/mongo-distinct-variable-pair.entity';
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

describe('Delete Distinct Variable Pair', (): void => {
  const find = findMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const remove = removeMock();
  const save = saveMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('DELETE /system/:systemId/distinct-variable-pair/:distinctVariablePairId', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test1';
    const lastName = 'User1';
    const email = 'test1.user1@example.com';
    const hashedPassword = hashSync('TestUser1!');
    const systemCount = 1;
    const constantSymbolCount = 10;
    const variableSymbolCount = 6;
    const distinctVariablePairCount = 1;
    const updatedDistinctVariablePairCount = distinctVariablePairCount - 1;
    const systemId = new ObjectId();
    const firstSymbolId = new ObjectId();
    const secondSymbolId = new ObjectId();
    const distinctVariablePairId = new ObjectId();
    const user = new MongoUserEntity();
    const updatedUser = new MongoUserEntity();
    const system = new MongoSystemEntity();
    const updatedSystem = new MongoSystemEntity();
    const firstSymbol = new MongoSymbolEntity();
    const updatedFirstSymbol = new MongoSymbolEntity();
    const secondSymbol = new MongoSymbolEntity();
    const updatedSecondSymbol = new MongoSymbolEntity();
    const distinctVariablePair = new MongoDistinctVariablePairEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashedPassword;
    user.systemCount = systemCount;
    user.constantSymbolCount = constantSymbolCount;
    user.variableSymbolCount = variableSymbolCount;
    user.distinctVariablePairCount = distinctVariablePairCount;
    updatedUser._id = userId;
    updatedUser.firstName = firstName;
    updatedUser.lastName = lastName;
    updatedUser.email = email;
    updatedUser.hashedPassword = hashedPassword;
    updatedUser.systemCount = systemCount;
    updatedUser.constantSymbolCount = constantSymbolCount;
    updatedUser.variableSymbolCount = variableSymbolCount;
    updatedUser.distinctVariablePairCount = updatedDistinctVariablePairCount;
    system._id = systemId;
    system.title = 'TestSystem1';
    system.description = 'Test System 1';
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.distinctVariablePairCount = distinctVariablePairCount;
    system.createdByUserId = userId;
    updatedSystem._id = systemId;
    updatedSystem.title = 'TestSystem1';
    updatedSystem.description = 'Test System 1';
    updatedSystem.constantSymbolCount = constantSymbolCount;
    updatedSystem.variableSymbolCount = variableSymbolCount;
    updatedSystem.distinctVariablePairCount = updatedDistinctVariablePairCount;
    updatedSystem.createdByUserId = userId;
    firstSymbol._id = firstSymbolId;
    firstSymbol.title = 'First';
    firstSymbol.description = 'First Symbol';
    firstSymbol.type = SymbolType.variable;
    firstSymbol.content = '1';
    firstSymbol.distinctVariablePairAppearanceCount = distinctVariablePairCount;
    firstSymbol.systemId = systemId;
    firstSymbol.createdByUserId = userId;
    updatedFirstSymbol._id = firstSymbolId;
    updatedFirstSymbol.title = 'First';
    updatedFirstSymbol.description = 'First Symbol';
    updatedFirstSymbol.type = SymbolType.variable;
    updatedFirstSymbol.content = '1';
    updatedFirstSymbol.distinctVariablePairAppearanceCount = updatedDistinctVariablePairCount;
    updatedFirstSymbol.systemId = systemId;
    updatedFirstSymbol.createdByUserId = userId;
    secondSymbol._id = secondSymbolId;
    secondSymbol.title = 'Second';
    secondSymbol.description = 'Second Symbol';
    secondSymbol.type = SymbolType.variable;
    secondSymbol.content = '2';
    secondSymbol.distinctVariablePairAppearanceCount = distinctVariablePairCount;
    secondSymbol.systemId = systemId;
    secondSymbol.createdByUserId = userId;
    updatedSecondSymbol._id = secondSymbolId;
    updatedSecondSymbol.title = 'Second';
    updatedSecondSymbol.description = 'Second Symbol';
    updatedSecondSymbol.type = SymbolType.variable;
    updatedSecondSymbol.content = '2';
    updatedSecondSymbol.distinctVariablePairAppearanceCount = updatedDistinctVariablePairCount;
    updatedSecondSymbol.systemId = systemId;
    updatedSecondSymbol.createdByUserId = userId;
    distinctVariablePair._id = distinctVariablePairId;
    distinctVariablePair.variableSymbolIds = [
      firstSymbolId,
      secondSymbolId
    ];
    distinctVariablePair.systemId = systemId;
    distinctVariablePair.createdByUserId = userId;

    find.mockResolvedValueOnce([
      firstSymbol,
      secondSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(distinctVariablePair);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    remove.mockResolvedValueOnce(distinctVariablePair);
    save.mockResolvedValueOnce(updatedUser);
    save.mockResolvedValueOnce(updatedFirstSymbol);
    save.mockResolvedValueOnce(updatedSecondSymbol);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).delete(`/system/${systemId}/distinct-variable-pair/${distinctVariablePairId}`).set('Cookie', [
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
      _id: distinctVariablePairId,
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
    expect(remove).toHaveBeenNthCalledWith(1, distinctVariablePair);
    expect(save).toHaveBeenCalledTimes(4);
    expect(save).toHaveBeenNthCalledWith(1, updatedUser);
    expect(save).toHaveBeenNthCalledWith(2, updatedFirstSymbol);
    expect(save).toHaveBeenNthCalledWith(3, updatedSecondSymbol);
    expect(save).toHaveBeenNthCalledWith(4, updatedSystem);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      id: distinctVariablePairId.toString(),
      variableSymbolIds: [
        firstSymbolId.toString(),
        secondSymbolId.toString()
      ],
      systemId: systemId.toString(),
      createdByUserId: userId.toString()
    });
  });

  it('POST /graphql mutation deleteDistinctVariablePair', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test1';
    const lastName = 'User1';
    const email = 'test1.user1@example.com';
    const hashedPassword = hashSync('TestUser1!');
    const systemCount = 1;
    const constantSymbolCount = 10;
    const variableSymbolCount = 6;
    const distinctVariablePairCount = 1;
    const updatedDistinctVariablePairCount = distinctVariablePairCount - 1;
    const systemId = new ObjectId();
    const firstSymbolId = new ObjectId();
    const secondSymbolId = new ObjectId();
    const distinctVariablePairId = new ObjectId();
    const user = new MongoUserEntity();
    const updatedUser = new MongoUserEntity();
    const system = new MongoSystemEntity();
    const updatedSystem = new MongoSystemEntity();
    const firstSymbol = new MongoSymbolEntity();
    const updatedFirstSymbol = new MongoSymbolEntity();
    const secondSymbol = new MongoSymbolEntity();
    const updatedSecondSymbol = new MongoSymbolEntity();
    const distinctVariablePair = new MongoDistinctVariablePairEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashedPassword;
    user.systemCount = systemCount;
    user.constantSymbolCount = constantSymbolCount;
    user.variableSymbolCount = variableSymbolCount;
    user.distinctVariablePairCount = distinctVariablePairCount;
    updatedUser._id = userId;
    updatedUser.firstName = firstName;
    updatedUser.lastName = lastName;
    updatedUser.email = email;
    updatedUser.hashedPassword = hashedPassword;
    updatedUser.systemCount = systemCount;
    updatedUser.constantSymbolCount = constantSymbolCount;
    updatedUser.variableSymbolCount = variableSymbolCount;
    updatedUser.distinctVariablePairCount = updatedDistinctVariablePairCount;
    system._id = systemId;
    system.title = 'TestSystem1';
    system.description = 'Test System 1';
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.distinctVariablePairCount = distinctVariablePairCount;
    system.createdByUserId = userId;
    updatedSystem._id = systemId;
    updatedSystem.title = 'TestSystem1';
    updatedSystem.description = 'Test System 1';
    updatedSystem.constantSymbolCount = constantSymbolCount;
    updatedSystem.variableSymbolCount = variableSymbolCount;
    updatedSystem.distinctVariablePairCount = updatedDistinctVariablePairCount;
    updatedSystem.createdByUserId = userId;
    firstSymbol._id = firstSymbolId;
    firstSymbol.title = 'First';
    firstSymbol.description = 'First Symbol';
    firstSymbol.type = SymbolType.variable;
    firstSymbol.content = '1';
    firstSymbol.distinctVariablePairAppearanceCount = distinctVariablePairCount;
    firstSymbol.systemId = systemId;
    firstSymbol.createdByUserId = userId;
    updatedFirstSymbol._id = firstSymbolId;
    updatedFirstSymbol.title = 'First';
    updatedFirstSymbol.description = 'First Symbol';
    updatedFirstSymbol.type = SymbolType.variable;
    updatedFirstSymbol.content = '1';
    updatedFirstSymbol.distinctVariablePairAppearanceCount = updatedDistinctVariablePairCount;
    updatedFirstSymbol.systemId = systemId;
    updatedFirstSymbol.createdByUserId = userId;
    secondSymbol._id = secondSymbolId;
    secondSymbol.title = 'Second';
    secondSymbol.description = 'Second Symbol';
    secondSymbol.type = SymbolType.variable;
    secondSymbol.content = '2';
    secondSymbol.distinctVariablePairAppearanceCount = distinctVariablePairCount;
    secondSymbol.systemId = systemId;
    secondSymbol.createdByUserId = userId;
    updatedSecondSymbol._id = secondSymbolId;
    updatedSecondSymbol.title = 'Second';
    updatedSecondSymbol.description = 'Second Symbol';
    updatedSecondSymbol.type = SymbolType.variable;
    updatedSecondSymbol.content = '2';
    updatedSecondSymbol.distinctVariablePairAppearanceCount = updatedDistinctVariablePairCount;
    updatedSecondSymbol.systemId = systemId;
    updatedSecondSymbol.createdByUserId = userId;
    distinctVariablePair._id = distinctVariablePairId;
    distinctVariablePair.variableSymbolIds = [
      firstSymbolId,
      secondSymbolId
    ];
    distinctVariablePair.systemId = systemId;
    distinctVariablePair.createdByUserId = userId;

    find.mockResolvedValueOnce([
      firstSymbol,
      secondSymbol
    ]);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(distinctVariablePair);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    remove.mockResolvedValueOnce(distinctVariablePair);
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
      query: 'mutation deleteDistinctVariablePair($systemId: String!, $distinctVariablePairId: String!) { deleteDistinctVariablePair(systemId: $systemId, distinctVariablePairId: $distinctVariablePairId) { id variableSymbolIds systemId createdByUserId } }',
      variables: {
        systemId,
        distinctVariablePairId
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
      _id: distinctVariablePairId,
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
    expect(remove).toHaveBeenNthCalledWith(1, distinctVariablePair);
    expect(save).toHaveBeenCalledTimes(4);
    expect(save).toHaveBeenNthCalledWith(1, updatedUser);
    expect(save).toHaveBeenNthCalledWith(2, updatedFirstSymbol);
    expect(save).toHaveBeenNthCalledWith(3, updatedSecondSymbol);
    expect(save).toHaveBeenNthCalledWith(4, updatedSystem);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        deleteDistinctVariablePair: {
          id: distinctVariablePairId.toString(),
          variableSymbolIds: [
            firstSymbolId.toString(),
            secondSymbolId.toString()
          ],
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
