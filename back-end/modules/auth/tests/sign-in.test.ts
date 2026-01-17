import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Sign In', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /auth/sign-in (configuration read: successful, user search: successful, payload: valid)', async (): Promise<void> => {
    const email = 'test1.user1@example.com';
    const password = 'Test1User1!';
    const user = new MongoUserEntity();

    user.firstName = 'Test1';
    user.lastName = 'User1';
    user.email = email;
    user.hashedPassword = hashSync(password);

    findOneBy.mockResolvedValueOnce(user);
    getOrThrow.mockReturnValueOnce(1000);

    const response = await request(app.getHttpServer()).post('/auth/sign-in').send({
      email,
      password
    });

    const { statusCode, body } = response;
    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      email
    });
    expect(getOrThrow).toHaveBeenCalledTimes(1);
    expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
    expect(statusCode).toBe(HttpStatus.NO_CONTENT);
    expect(body).toStrictEqual({
    });
    expect(cookies).toBeDefined();
    expect(cookies).toHaveLength(2);
    expect(cookies![0]).toMatch(/^token=.+; Max-Age=1; Path=\/; Expires=(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (0[1-9]|[12]\d|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} ([01]\d|2[0-3]):([0-5]\d):([0-5]\d) GMT; HttpOnly; Secure$/);
    expect(cookies![1]).toMatch(/^authStatus=true; Max-Age=1; Path=\/; Expires=(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (0[1-9]|[12]\d|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} ([01]\d|2[0-3]):([0-5]\d):([0-5]\d) GMT; Secure$/);
  });

  it('POST /graphql mutation signIn (configuration read: successful, user search: successful, payload: valid)', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test1';
    const lastName = 'User1';
    const email = 'test1.user1@example.com';
    const password = 'Test1User1!';
    const user = new MongoUserEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = 'User1';
    user.email = email;
    user.hashedPassword = hashSync(password);

    findOneBy.mockResolvedValueOnce(user);
    getOrThrow.mockReturnValueOnce(1000);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'mutation signIn($email: String!, $password: String!) { signIn(email: $email, password: $password) { id firstName lastName email systemCount constantSymbolCount variableSymbolCount axiomCount theoremCount deductionCount proofCount } }',
      variables: {
        email,
        password
      }
    });

    const { statusCode, body } = response;
    const cookies = response.get('Set-Cookie');

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      email
    });
    expect(getOrThrow).toHaveBeenCalledTimes(1);
    expect(getOrThrow).toHaveBeenNthCalledWith(1, 'AUTH_COOKIE_MAX_AGE_MILLISECONDS');
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        signIn: {
          id: userId.toString(),
          firstName,
          lastName,
          email,
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
    expect(cookies![0]).toMatch(/^token=.+; Max-Age=1; Path=\/; Expires=(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (0[1-9]|[12]\d|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} ([01]\d|2[0-3]):([0-5]\d):([0-5]\d) GMT; HttpOnly; Secure$/);
    expect(cookies![1]).toMatch(/^authStatus=true; Max-Age=1; Path=\/; Expires=(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (0[1-9]|[12]\d|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} ([01]\d|2[0-3]):([0-5]\d):([0-5]\d) GMT; Secure$/);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
