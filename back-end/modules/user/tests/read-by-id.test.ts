import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Read User by ID', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /user/session-user', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test1';
    const lastName = 'User1';
    const email = 'test1.user1@example.com';
    const systemCount = 1;
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const user = new MongoUserEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashSync('Test1User1!');
    user.systemCount = systemCount;
    user.constantSymbolCount = constantSymbolCount;
    user.variableSymbolCount = variableSymbolCount;

    findOneBy.mockResolvedValueOnce(user);

    const response = await request(app.getHttpServer()).get(`/user/${userId}`);

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      id: userId.toString(),
      firstName,
      lastName,
      email,
      systemCount,
      constantSymbolCount,
      variableSymbolCount
    });
  });

  it('POST /graphql query sessionUser', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test1';
    const lastName = 'User1';
    const email = 'test1.user1@example.com';
    const systemCount = 1;
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const user = new MongoUserEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashSync('Test1User1!');
    user.systemCount = systemCount;
    user.constantSymbolCount = constantSymbolCount;
    user.variableSymbolCount = variableSymbolCount;

    findOneBy.mockResolvedValueOnce(user);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query user($userId: String!) { user(userId: $userId) { id firstName lastName email systemCount constantSymbolCount variableSymbolCount } }',
      variables: {
        userId
      }
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        user: {
          id: userId.toString(),
          firstName,
          lastName,
          email,
          systemCount,
          constantSymbolCount,
          variableSymbolCount
        }
      }
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
