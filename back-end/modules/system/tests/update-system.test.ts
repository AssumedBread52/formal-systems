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
    const axiomCount = 6;
    const theoremCount = 1;
    const deductionCount = 3;
    const proofCount = 6;
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
    system.axiomCount = axiomCount;
    system.theoremCount = theoremCount;
    system.deductionCount = deductionCount;
    system.proofCount = proofCount;
    system.createdByUserId = userId;
    updatedSystem._id = systemId;
    updatedSystem.title = newTitle;
    updatedSystem.description = newDescription;
    updatedSystem.constantSymbolCount = constantSymbolCount;
    updatedSystem.variableSymbolCount = variableSymbolCount;
    updatedSystem.axiomCount = axiomCount;
    updatedSystem.theoremCount = theoremCount;
    updatedSystem.deductionCount = deductionCount;
    updatedSystem.proofCount = proofCount;
    updatedSystem.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
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

    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
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
      axiomCount,
      theoremCount,
      deductionCount,
      proofCount,
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
    const axiomCount = 6;
    const theoremCount = 1;
    const deductionCount = 3;
    const proofCount = 6;
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
    system.axiomCount = axiomCount;
    system.theoremCount = theoremCount;
    system.deductionCount = deductionCount;
    system.proofCount = proofCount;
    system.createdByUserId = userId;
    updatedSystem._id = systemId;
    updatedSystem.title = newTitle;
    updatedSystem.description = newDescription;
    updatedSystem.constantSymbolCount = constantSymbolCount;
    updatedSystem.variableSymbolCount = variableSymbolCount;
    updatedSystem.axiomCount = axiomCount;
    updatedSystem.theoremCount = theoremCount;
    updatedSystem.deductionCount = deductionCount;
    updatedSystem.proofCount = proofCount;
    updatedSystem.createdByUserId = userId;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    findOneBy.mockResolvedValueOnce(null);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation updateSystem($systemId: String!, $editSystemPayload: EditSystemPayload!) { updateSystem(systemId: $systemId, systemPayload: $editSystemPayload) { id title description constantSymbolCount variableSymbolCount axiomCount theoremCount deductionCount proofCount createdByUserId } }',
      variables: {
        systemId,
        editSystemPayload: {
          newTitle,
          newDescription
        }
      }
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(3);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: systemId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(3, {
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
          axiomCount,
          theoremCount,
          deductionCount,
          proofCount,
          createdByUserId: userId.toString()
        }
      }
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
