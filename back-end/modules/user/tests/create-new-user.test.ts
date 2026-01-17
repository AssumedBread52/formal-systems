import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Create New User', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /user (configuration read: successful, save: successful, conflict: not found, payload: valid)', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test1';
    const lastName = 'User1';
    const email = 'test1.user1@example.com';
    const password = 'Test1User1!';
    const user = new MongoUserEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashSync(password);

    findOneBy.mockResolvedValueOnce(null);
    getOrThrow.mockReturnValueOnce(1000);
    save.mockResolvedValueOnce(user);

    const response = await request(app.getHttpServer()).post('/user').send({
      firstName,
      lastName,
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
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      _id: expect.objectContaining(/^[0-9a-f]{24}$/),
      firstName,
      lastName,
      email,
      hashedPassword: expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
      systemCount: 0,
      constantSymbolCount: 0,
      variableSymbolCount: 0,
      axiomCount: 0,
      theoremCount: 0,
      deductionCount: 0,
      proofCount: 0
    });
    expect(statusCode).toBe(HttpStatus.CREATED);
    expect(body).toStrictEqual({
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
    });
    expect(cookies).toBeDefined();
    expect(cookies).toHaveLength(2);
    expect(cookies![0]).toMatch(/^token=.+; Max-Age=1; Path=\/; Expires=(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (0[1-9]|[12]\d|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} ([01]\d|2[0-3]):([0-5]\d):([0-5]\d) GMT; HttpOnly; Secure$/);
    expect(cookies![1]).toMatch(/^authStatus=true; Max-Age=1; Path=\/; Expires=(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (0[1-9]|[12]\d|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} ([01]\d|2[0-3]):([0-5]\d):([0-5]\d) GMT; Secure$/);
  });

  it('POST /graphql mutation createUser (configuration read: successful, save: successful, conflict: not found, payload: valid)', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test1';
    const lastName = 'User1';
    const email = 'test1.user1@example.com';
    const password = 'Test1User1!';
    const user = new MongoUserEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashSync(password);

    findOneBy.mockResolvedValueOnce(null);
    getOrThrow.mockReturnValueOnce(1000);
    save.mockResolvedValueOnce(user);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'mutation createUser($userPayload: NewUserPayload!) { createUser(userPayload: $userPayload) { id firstName lastName email systemCount constantSymbolCount variableSymbolCount axiomCount theoremCount deductionCount proofCount } }',
      variables: {
        userPayload: {
          firstName,
          lastName,
          email,
          password
        }
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
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      _id: expect.objectContaining(/^[0-9a-f]{24}$/),
      firstName,
      lastName,
      email,
      hashedPassword: expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
      systemCount: 0,
      constantSymbolCount: 0,
      variableSymbolCount: 0,
      axiomCount: 0,
      theoremCount: 0,
      deductionCount: 0,
      proofCount: 0
    });
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        createUser: {
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
