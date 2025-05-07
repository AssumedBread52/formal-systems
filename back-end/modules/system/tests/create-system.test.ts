import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { existsByMock } from '@/common/tests/mocks/exists-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hashSync } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Create System', (): void => {
  const existsBy = existsByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('succeeds', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test';
    const lastName = 'User';
    const email = 'test@example.com';
    const hashedPassword = hashSync('TestUser1!', 12);
    const systemCount = 1;
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const axiomCount = 6;
    const theoremCount = 1;
    const deductionCount = 3;
    const proofCount = 6;
    const systemId = new ObjectId();
    const title = 'Test System';
    const description = 'This is a test.';
    const user = new MongoUserEntity();
    const updatedUser = new MongoUserEntity();
    const system = new MongoSystemEntity();

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
    updatedUser.systemCount = systemCount + 1;
    updatedUser.constantSymbolCount = constantSymbolCount;
    updatedUser.variableSymbolCount = variableSymbolCount;
    updatedUser.axiomCount = axiomCount;
    updatedUser.theoremCount = theoremCount;
    updatedUser.deductionCount = deductionCount;
    updatedUser.proofCount = proofCount;
    system._id = systemId;
    system.title = title;
    system.description = description;
    system.createdByUserId = userId;

    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(user);
    save.mockResolvedValueOnce(system);
    save.mockResolvedValueOnce(updatedUser);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/system').set('Cookie', [
      `token=${token}`
    ]).send({
      title,
      description
    });

    const { statusCode, body } = response;

    expect(existsBy).toHaveBeenCalledTimes(1);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      title,
      createdByUserId: userId
    });
    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      _id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenNthCalledWith(1, {
      _id: expect.objectContaining(/[0-9a-f]{24}/),
      title,
      description,
      constantSymbolCount: 0,
      variableSymbolCount: 0,
      axiomCount: 0,
      theoremCount: 0,
      deductionCount: 0,
      proofCount: 0,
      createdByUserId: userId
    });
    expect(save).toHaveBeenNthCalledWith(2, updatedUser);
    expect(statusCode).toBe(HttpStatus.CREATED);
    expect(body).toEqual({
      id: systemId.toString(),
      title,
      description,
      constantSymbolCount: 0,
      variableSymbolCount: 0,
      axiomCount: 0,
      theoremCount: 0,
      deductionCount: 0,
      proofCount: 0,
      createdByUserId: userId.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
