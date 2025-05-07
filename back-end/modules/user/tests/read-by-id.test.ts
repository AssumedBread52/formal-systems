import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Read User by ID', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('succeeds', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test';
    const lastName = 'User';
    const email = 'test@example.com';
    const systemCount = 1;
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const axiomCount = 6;
    const theoremCount = 1;
    const deductionCount = 3;
    const proofCount = 6;
    const user = new MongoUserEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.systemCount = systemCount;
    user.constantSymbolCount = constantSymbolCount;
    user.variableSymbolCount = variableSymbolCount;
    user.axiomCount = axiomCount;
    user.theoremCount = theoremCount;
    user.deductionCount = deductionCount;
    user.proofCount = proofCount;

    findOneBy.mockResolvedValueOnce(user);

    const response = await request(app.getHttpServer()).get(`/user/${userId}`);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
      id: userId.toString(),
      firstName,
      lastName,
      email,
      systemCount,
      constantSymbolCount,
      variableSymbolCount,
      axiomCount,
      theoremCount,
      deductionCount,
      proofCount
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
