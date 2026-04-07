import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findByMock } from '@/common/tests/mocks/find-by.mock';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { In } from 'typeorm';

describe('Relations', (): void => {
  const findBy = findByMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /graphql query user', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const handle = 'Test1 User1';
    const email = 'test1.user1@example.com';
    const user = validatePayload({
      id: userId,
      handle,
      email,
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const system = validatePayload({
      id: 'ebe1615e-8c75-461a-b6f4-29db73a14ee7',
      ownerUserId: userId,
      name: 'TestSystem1',
      description: 'Test System 1'
    }, SystemEntity);

    findBy.mockResolvedValueOnce([system]);
    findOneBy.mockResolvedValueOnce(user);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($userId: String!) { user(userId: $userId) { id handle email systems { id ownerUserId name description } } }',
      variables: {
        userId
      }
    });

    expect(findBy).toHaveBeenCalledTimes(1);
    expect(findBy).toHaveBeenNthCalledWith(1, {
      ownerUserId: In([userId])
    });
    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: userId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        user: {
          id: userId,
          handle,
          email,
          systems: [instanceToPlain(system)]
        }
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
