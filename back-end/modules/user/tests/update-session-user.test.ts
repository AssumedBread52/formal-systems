import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { existsByMock } from '@/common/tests/mocks/exists-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hashSync } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Update Session User', (): void => {
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
    const systemCount = 1;
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const axiomCount = 6;
    const theoremCount = 1;
    const deductionCount = 2;
    const proofCount = 3;
    const newFirstName = 'Test2';
    const newLastName = 'User2';
    const newEmail = 'test2@example.com';
    const newPassword = 'TestUser2!';
    const originalUser = new MongoUserEntity();
    const updatedUser = new MongoUserEntity();

    originalUser._id = userId;
    originalUser.firstName = 'Test1';
    originalUser.lastName = 'User1';
    originalUser.email = 'test1@example.com';
    originalUser.hashedPassword = hashSync('TestUser1!', 12);
    originalUser.systemCount = systemCount;
    originalUser.constantSymbolCount = constantSymbolCount;
    originalUser.variableSymbolCount = variableSymbolCount;
    originalUser.axiomCount = axiomCount;
    originalUser.theoremCount = theoremCount;
    originalUser.deductionCount = deductionCount;
    originalUser.proofCount = proofCount;
    updatedUser._id = userId;
    updatedUser.firstName = newFirstName;
    updatedUser.lastName = newLastName;
    updatedUser.email = newEmail;
    updatedUser.hashedPassword = hashSync(newPassword, 12);
    updatedUser.systemCount = systemCount;
    updatedUser.constantSymbolCount = constantSymbolCount;
    updatedUser.variableSymbolCount = variableSymbolCount;
    updatedUser.axiomCount = axiomCount;
    updatedUser.theoremCount = theoremCount;
    updatedUser.deductionCount = deductionCount;
    updatedUser.proofCount = proofCount;

    existsBy.mockResolvedValueOnce(false);
    findOneBy.mockResolvedValueOnce(originalUser);
    save.mockResolvedValueOnce(updatedUser);

    const token = app.get(JwtService).sign({
      userId
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

    expect(existsBy).toHaveBeenCalledTimes(1);
    expect(existsBy).toHaveBeenNthCalledWith(1, {
      email: newEmail
    });
    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      _id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenNthCalledWith(1, {
      _id: userId,
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail,
      hashedPassword: expect.stringMatching(/^\$2b\$12\$.+$/),
      systemCount,
      constantSymbolCount,
      variableSymbolCount,
      axiomCount,
      theoremCount,
      deductionCount,
      proofCount
    });
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toEqual({
      id: userId.toString(),
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail,
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
