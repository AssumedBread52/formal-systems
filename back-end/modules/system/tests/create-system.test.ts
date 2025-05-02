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
    const systemId = new ObjectId();
    const title = 'Test System';
    const description = 'This is a test.';
    const createdByUserId = new ObjectId();
    const user = new MongoUserEntity();
    const system = new MongoSystemEntity();

    user._id = createdByUserId;
    system._id = systemId;
    system.title = title;
    system.description = description;
    system.createdByUserId = createdByUserId;

    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(user);
    save.mockResolvedValueOnce(system);

    const token = app.get(JwtService).sign({
      userId: createdByUserId
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
      createdByUserId
    });
    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: createdByUserId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
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
      createdByUserId
    });
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
      createdByUserId: createdByUserId.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
