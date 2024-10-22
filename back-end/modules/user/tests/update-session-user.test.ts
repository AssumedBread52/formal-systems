import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/app/tests/mocks/get-or-throw.mock';
import { TokenService } from '@/auth/services/token.service';
import { testExpiredToken } from '@/auth/tests/helpers/test-expired-token';
import { testInvalidToken } from '@/auth/tests/helpers/test-invalid-token';
import { testMissingToken } from '@/auth/tests/helpers/test-missing-token';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hashSync } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { UserRepositoryMock } from './mocks/user-repository.mock';

describe('Update Session User', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails without a token', async (): Promise<void> => {
    await testMissingToken(app, 'patch', '/user/session-user');
  });

  it('fails with an expired token', async (): Promise<void> => {
    await testExpiredToken(app, 'patch', '/user/session-user');
  });

  it('fails with an invalid token', async (): Promise<void> => {
    await testInvalidToken(app, 'patch', '/user/session-user');
  });

  it('fails with an invalid payload', async (): Promise<void> => {
    const user = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(user);

    const token = app.get(TokenService).generateToken(user._id);

    const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
      `token=${token}`
    ]);

    expectCorrectResponse(response, HttpStatus.BAD_REQUEST, {
      error: 'Bad Request',
      message: [
        'newFirstName should not be empty',
        'newLastName should not be empty',
        'newEmail must be an email'
      ],
      statusCode: HttpStatus.BAD_REQUEST
    });
  });

  it('fails if the new e-mail address is already in use', async (): Promise<void> => {
    const userId = new ObjectId();
    const firstName = 'Test';
    const lastName = 'User';
    const email = 'test@example.com';
    const password = '123456';
    const newFirstName = 'User';
    const newLastName = 'Example';
    const newEmail = 'example@test.com';
    const newPassword = 'qwerty';
    const user = new UserEntity();
    const conflictUser = new UserEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashSync(password, 12);
    conflictUser.email = newEmail;

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(conflictUser);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
      `token=${token}`
    ]).send({
      newFirstName,
      newLastName,
      newEmail,
      newPassword
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      email: newEmail
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(0);
    expect(statusCode).toBe(HttpStatus.CONFLICT);
    expect(body).toEqual({
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
    const newFirstName = 'User';
    const newLastName = 'Example';
    const newEmail = 'example@test.com';
    const newPassword = 'qwerty';
    const user = new UserEntity();
    const newUser = new UserEntity();

    user._id = userId;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.hashedPassword = hashSync(password, 12);
    newUser._id = userId;
    newUser.firstName = newFirstName;
    newUser.lastName = newLastName;
    newUser.email = newEmail;
    newUser.hashedPassword = hashSync(newPassword, 12);

    findOneBy.mockResolvedValueOnce(user);
    findOneBy.mockResolvedValueOnce(null);
    save.mockResolvedValueOnce(newUser);

    const token = app.get(JwtService).sign({
      id: userId
    });

    const response = await request(app.getHttpServer()).patch('/user/session-user').set('Cookie', [
      `token=${token}`
    ]).send({
      newFirstName,
      newLastName,
      newEmail,
      newPassword
    });

    const { statusCode, body } = response;

    expect(findOneBy).toHaveBeenCalledTimes(2);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(findOneBy).toHaveBeenNthCalledWith(2, {
      email: newEmail
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      _id: userId,
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail,
      hashedPassword: expect.stringMatching(/\$2a\$12\$.+/),
      systemCount: user.systemCount,
      constantSymbolCount: user.constantSymbolCount,
      variableSymbolCount: user.variableSymbolCount,
      axiomCount: user.axiomCount,
      theoremCount: user.theoremCount,
      deductionCount: user.deductionCount
    });
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
      id: userId.toString(),
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail,
      systemCount: user.systemCount,
      constantSymbolCount: user.constantSymbolCount,
      variableSymbolCount: user.variableSymbolCount,
      axiomCount: user.axiomCount,
      theoremCount: user.theoremCount,
      deductionCount: user.deductionCount
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
