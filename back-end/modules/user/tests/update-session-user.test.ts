import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { saveMock } from '@/common/tests/mocks/save.mock';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';

describe('Update Session User', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  const save = saveMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('PATCH /user/session-user (conflict: not found, token: valid)', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemCount = 1;
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const axiomCount = 6;
    const theoremCount = 1;
    const deductionCount = 3;
    const proofCount = 6;
    const newFirstName = 'NewTest1';
    const newLastName = 'NewUser1';
    const newEmail = 'newtest1.newuser1@example.com';
    const newPassword = 'NewTestNewUser1!';
    const originalUser = new MongoUserEntity();
    const updatedUser = new MongoUserEntity();

    originalUser._id = userId;
    originalUser.firstName = 'Test1';
    originalUser.lastName = 'User1';
    originalUser.email = 'test1.user1@example.com';
    originalUser.hashedPassword = hashSync('TestUser1!');
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
    updatedUser.hashedPassword = hashSync(newPassword);
    updatedUser.systemCount = systemCount;
    updatedUser.constantSymbolCount = constantSymbolCount;
    updatedUser.variableSymbolCount = variableSymbolCount;
    updatedUser.axiomCount = axiomCount;
    updatedUser.theoremCount = theoremCount;
    updatedUser.deductionCount = deductionCount;
    updatedUser.proofCount = proofCount;

    findOneBy.mockResolvedValueOnce(originalUser);
    findOneBy.mockResolvedValueOnce(null);
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
      hashedPassword: expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
      systemCount,
      constantSymbolCount,
      variableSymbolCount,
      axiomCount,
      theoremCount,
      deductionCount,
      proofCount
    });
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
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

  it('POST /graphql query sessionUser (conflict: not found, token: valid)', async (): Promise<void> => {
    const userId = new ObjectId();
    const systemCount = 1;
    const constantSymbolCount = 6;
    const variableSymbolCount = 3;
    const axiomCount = 6;
    const theoremCount = 1;
    const deductionCount = 3;
    const proofCount = 6;
    const newFirstName = 'NewTest1';
    const newLastName = 'NewUser1';
    const newEmail = 'newtest1.newuser1@example.com';
    const newPassword = 'NewTestNewUser1!';
    const originalUser = new MongoUserEntity();
    const updatedUser = new MongoUserEntity();

    originalUser._id = userId;
    originalUser.firstName = 'Test1';
    originalUser.lastName = 'User1';
    originalUser.email = 'test1.user1@example.com';
    originalUser.hashedPassword = hashSync('TestUser1!');
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
    updatedUser.hashedPassword = hashSync(newPassword);
    updatedUser.systemCount = systemCount;
    updatedUser.constantSymbolCount = constantSymbolCount;
    updatedUser.variableSymbolCount = variableSymbolCount;
    updatedUser.axiomCount = axiomCount;
    updatedUser.theoremCount = theoremCount;
    updatedUser.deductionCount = deductionCount;
    updatedUser.proofCount = proofCount;

    findOneBy.mockResolvedValueOnce(originalUser);
    findOneBy.mockResolvedValueOnce(null);
    save.mockResolvedValueOnce(updatedUser);

    const token = app.get(JwtService).sign({
      userId
    });

    const response = await request(app.getHttpServer()).post('/graphql').set('Cookie', [
      `token=${token}`
    ]).send({
      query: 'mutation updateUser($userPayload: EditUserPayload!) { updateUser(userPayload: $userPayload) { id firstName lastName email systemCount constantSymbolCount variableSymbolCount axiomCount theoremCount deductionCount proofCount } }',
      variables: {
        userPayload: {
          newFirstName,
          newLastName,
          newEmail,
          newPassword
        }
      }
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
      hashedPassword: expect.stringMatching(/^\$2[aby]\$[0-9]{2}\$[.\/A-Za-z0-9]{53}$/),
      systemCount,
      constantSymbolCount,
      variableSymbolCount,
      axiomCount,
      theoremCount,
      deductionCount,
      proofCount
    });
    expect(statusCode).toBe(HttpStatus.OK);
    expect(body).toStrictEqual({
      data: {
        updateUser: {
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
        }
      }
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
