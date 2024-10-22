import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { UserRepositoryMock } from './mocks/user-repository.mock';

describe('Create New User', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).post('/user');

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'firstName should not be empty',
        'lastName should not be empty',
        'email must be an email',
        'password should not be empty'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails with e-mail address collision', async (): Promise<void> => {
    const email = 'test@example.com';

    const conflictUser = new UserEntity();

    conflictUser.email = email;

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(conflictUser);

    const response = await request(app.getHttpServer()).post('/user').send({
      firstName: 'Test',
      lastName: 'User',
      email,
      password: '123456'
    });

    expectCorrectResponse(response, HttpStatus.CONFLICT, {
      error: 'Conflict',
      message: 'Users must have a unique e-mail address.',
      statusCode: HttpStatus.CONFLICT
    });
  });

  it('succeeds', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test';
    const lastName = 'User';
    const email = 'test@example.com';
    const password = '123456';
    const user = new UserEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;

    findOneBy.mockResolvedValueOnce(null);
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
      _id: expect.objectContaining(/[0-9a-f]{24}/),
      firstName,
      lastName,
      email,
      hashedPassword: expect.stringMatching(/\$2a\$12\$.+/),
      systemCount: 0,
      constantSymbolCount: 0,
      variableSymbolCount: 0,
      axiomCount: 0,
      theoremCount: 0,
      deductionCount: 0
    });
    expect(statusCode).toBe(HttpStatus.CREATED);
    expect(body).toEqual({
      id: userId.toString(),
      firstName,
      lastName,
      email,
      systemCount: 0,
      constantSymbolCount: 0,
      variableSymbolCount: 0,
      axiomCount: 0,
      theoremCount: 0,
      deductionCount: 0
    });
    expect(cookies).toBeDefined();
    expect(cookies).toHaveLength(2);
    expect(cookies![0]).toMatch(/^token=.+; Max-Age=1; .+; HttpOnly; Secure$/);
    expect(cookies![1]).toMatch(/^authStatus=true; Max-Age=1; .+; Secure$/);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
