import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { findMock } from '@/common/tests/mocks/find.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import * as request from 'supertest';
import { In } from 'typeorm';

describe('Relations', (): void => {
  const find = findMock();
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('POST /graphql query system', async (): Promise<void> => {
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const name = 'TestSystem1';
    const description = 'Test System 1';
    const user = validatePayload({
      id: userId,
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);
    const system = validatePayload({
      id: systemId,
      ownerUserId: userId,
      name,
      description
    }, SystemEntity);

    find.mockResolvedValueOnce([
      user
    ]);
    findOneBy.mockResolvedValueOnce(system);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!) { system(systemId: $systemId) { id ownerUserId name description owner { id handle email } } }',
      variables: {
        systemId
      }
    });

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenNthCalledWith(1, {
      where: {
        id: In([
          userId
        ])
      }
    });
    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        system: {
          id: systemId,
          ownerUserId: userId,
          name,
          description,
          owner: instanceToPlain(user)
        }
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
