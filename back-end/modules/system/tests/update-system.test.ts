import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Update System', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('PATCH /system/:systemId', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemId = new ObjectId();
    const newTitle = 'TestSystem2';
    const newDescription = 'Test System 2';
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const distinctVariablePairCount = 1;
    const constantVariablePairExpressionCount = 5;
    const constantPrefixedExpressionCount = 25;
    const standardExpressionCount = 125;
    const user = new MongoUserEntity();
    const system = new MongoSystemEntity();
    const updatedSystem = new MongoSystemEntity();

    user._id = userId;
    user.firstName = 'Test1';
    user.lastName = 'User1';
    user.email = 'test1.user1@example.com';
    user.hashedPassword = hashSync('TestUser1!');
    system._id = systemId;
    system.title = 'TestSystem1';
    system.description = 'Test System 1';
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.distinctVariablePairCount = distinctVariablePairCount;
    system.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    system.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    system.standardExpressionCount = standardExpressionCount;
    system.createdByUserId = userId;
    updatedSystem._id = systemId;
    updatedSystem.title = newTitle;
    updatedSystem.description = newDescription;
    updatedSystem.constantSymbolCount = constantSymbolCount;
    updatedSystem.variableSymbolCount = variableSymbolCount;
    updatedSystem.distinctVariablePairCount = distinctVariablePairCount;
    updatedSystem.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    updatedSystem.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    updatedSystem.standardExpressionCount = standardExpressionCount;
    updatedSystem.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(null);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(4);
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
      title: newTitle,
      createdByUserId: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, updatedSystem);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      id: systemId.toString(),
      title: newTitle,
      description: newDescription,
      constantSymbolCount,
      variableSymbolCount,
      distinctVariablePairCount,
      constantVariablePairExpressionCount,
      constantPrefixedExpressionCount,
      standardExpressionCount,
      createdByUserId: userId.toString()
    });
  });

  it('POST /graphql mutation updateSystem', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemId = new ObjectId();
    const newTitle = 'TestSystem2';
    const newDescription = 'Test System 2';
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const distinctVariablePairCount = 1;
    const constantVariablePairExpressionCount = 5;
    const constantPrefixedExpressionCount = 25;
    const standardExpressionCount = 125;
    const user = new MongoUserEntity();
    const system = new MongoSystemEntity();
    const updatedSystem = new MongoSystemEntity();

    user._id = userId;
    user.firstName = 'Test1';
    user.lastName = 'User1';
    user.email = 'test1.user1@example.com';
    user.hashedPassword = hashSync('TestUser1!');
    system._id = systemId;
    system.title = 'TestSystem1';
    system.description = 'Test System 1';
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.distinctVariablePairCount = distinctVariablePairCount;
    system.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    system.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    system.standardExpressionCount = standardExpressionCount;
    system.createdByUserId = userId;
    updatedSystem._id = systemId;
    updatedSystem.title = newTitle;
    updatedSystem.description = newDescription;
    updatedSystem.constantSymbolCount = constantSymbolCount;
    updatedSystem.variableSymbolCount = variableSymbolCount;
    updatedSystem.distinctVariablePairCount = distinctVariablePairCount;
    updatedSystem.constantVariablePairExpressionCount = constantVariablePairExpressionCount;
    updatedSystem.constantPrefixedExpressionCount = constantPrefixedExpressionCount;
    updatedSystem.standardExpressionCount = standardExpressionCount;
    updatedSystem.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(null);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation updateSystem($systemId: String!, $editSystemPayload: EditSystemPayload!) { updateSystem(systemId: $systemId, systemPayload: $editSystemPayload) { id title description constantSymbolCount variableSymbolCount distinctVariablePairCount constantVariablePairExpressionCount constantPrefixedExpressionCount standardExpressionCount createdByUserId } }',
      variables: {
        systemId,
        editSystemPayload: {
          newTitle,
          newDescription
        }
      }
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(4);
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
      title: newTitle,
      createdByUserId: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, updatedSystem);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        updateSystem: {
          id: systemId.toString(),
          title: newTitle,
          description: newDescription,
          constantSymbolCount,
          variableSymbolCount,
          distinctVariablePairCount,
          constantVariablePairExpressionCount,
          constantPrefixedExpressionCount,
          standardExpressionCount,
          createdByUserId: userId.toString()
        }
      }
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
