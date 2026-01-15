import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Sign Out', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /auth/sign-out (user search: successful)', async (): Promise<void> => {
    const userId = new ObjectId();
    const user = new MongoUserEntity();

    user._id = userId;
    user.firstName = 'Test1';
    user.lastName = 'User1';
    user.email = 'test1.user1@example.com';
    user.hashedPassword = hashSync('Test1User1!');

    findOneBy.mockResolvedValueOnce(user);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/auth/sign-out').set('Cookie', [
      `token=${token}`
    ]);

    const { statusCode, body } = response;
    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(body).toStrictEqual({
    });
    expect(cookies).toBeDefined();
    expect(cookies).toHaveLength(2);
    expect(cookies![0]).toBe('token=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    expect(cookies![1]).toBe('authStatus=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  });

  it('POST /graphql mutation signOut (user search: successful)', async (): Promise<void> => {
    const userId = new ObjectId();
    const user = new MongoUserEntity();

    user._id = userId;
    user.firstName = 'Test1';
    user.lastName = 'User1';
    user.email = 'test1.user1@example.com';
    user.hashedPassword = hashSync('Test1User1!');

    findOneBy.mockResolvedValueOnce(user);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation { signOut { id firstName lastName email systemCount constantSymbolCount variableSymbolCount axiomCount theoremCount deductionCount proofCount } }'
    });

    const { statusCode, body } = response;
    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        signOut: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          systemCount: 0,
          constantSymbolCount: 0,
          variableSymbolCount: 0,
          axiomCount: 0,
          theoremCount: 0,
          deductionCount: 0,
          proofCount: 0
        }
      }
    });
    expect(cookies).toBeDefined();
    expect(cookies).toHaveLength(2);
    expect(cookies![0]).toBe('token=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    expect(cookies![1]).toBe('authStatus=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
