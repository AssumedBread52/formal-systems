import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { UserEntity } from '@/user/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { UserRepositoryMock } from './mocks/user-repository.mock';

describe('Read User by ID', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails if user is not found', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/user/${new ObjectId()}`);

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'User not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('succeeds', async (): Promise<void> => {
    const testUser = new UserEntity();

    const userRepositoryMock = app.get(getRepositoryToken(UserEntity)) as UserRepositoryMock;

    userRepositoryMock.findOneBy.mockReturnValueOnce(testUser);

    const { _id, firstName, lastName, email, systemCount, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount } = testUser;

    const response = await request(app.getHttpServer()).get(`/user/${_id}`);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: _id.toString(),
      firstName,
      lastName,
      email,
      systemCount,
      constantSymbolCount,
      variableSymbolCount,
      axiomCount,
      theoremCount,
      deductionCount
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
