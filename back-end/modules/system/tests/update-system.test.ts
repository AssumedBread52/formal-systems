import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { existsByMock } from '@/common/tests/mocks/exists-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Update System', (): void => {
  const existsBy = existsByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('succeeds', async (): Promise<void> => {
    const systemId = new ObjectId();
    const newTitle = 'New Test System';
    const newDescription = 'This is a new test.';
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const axiomCount = 6;
    const theoremCount = 1;
    const deductionCount = 3;
    const proofCount = 6;
    const createdByUserId = new ObjectId();
    const user = new MongoUserEntity();
    const system = new MongoSystemEntity();
    const updatedSystem = new MongoSystemEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.title = 'Test System';
    system.description = 'This is a test.';
    system.constantSymbolCount = constantSymbolCount;
    system.variableSymbolCount = variableSymbolCount;
    system.axiomCount = axiomCount;
    system.theoremCount = theoremCount;
    system.deductionCount = deductionCount;
    system.proofCount = proofCount;
    system.createdByUserId = createdByUserId;
    updatedSystem._id = systemId;
    updatedSystem.title = newTitle;
    updatedSystem.description = newDescription;
    updatedSystem.constantSymbolCount = constantSymbolCount;
    updatedSystem.variableSymbolCount = variableSymbolCount;
    updatedSystem.axiomCount = axiomCount;
    updatedSystem.theoremCount = theoremCount;
    updatedSystem.deductionCount = deductionCount;
    updatedSystem.proofCount = proofCount;
    updatedSystem.createdByUserId = createdByUserId;

    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(system);
    save.mockResolvedValueOnce(updatedSystem);

    const token = app.get(JwtService).sign({
      userId: createdByUserId
    });

    const response = await request(app.getHttpServer()).patch(`/system/${systemId}`).set('Cookie', [
      `token=${token}`
    ]).send({
      newTitle,
      newDescription
    });

    const { statusCode, body } = response;

    expect(existsBy).toHaveBeenCalledTimes(1);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      title: newTitle,
      createdByUserId
    });
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, updatedSystem);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
      id: systemId.toString(),
      title: newTitle,
      description: newDescription,
      constantSymbolCount,
      variableSymbolCount,
      axiomCount,
      theoremCount,
      deductionCount,
      proofCount,
      createdByUserId: createdByUserId.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
