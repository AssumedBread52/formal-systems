import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { UserEntity } from '@/user/entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { hashSync } from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import * as request from 'supertest';
import { ILike } from 'typeorm';

describe('Read Users', (): void => {
  const findAndCount = findAndCountMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /user', async (): Promise<void> => {
    const page = 2;
    const pageSize = 20;
    const searchText = '1 User';
    const total = 1;
    const user = validatePayload({
      id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);

    findAndCount.mockResolvedValueOnce([
      [
        user
      ],
      total
    ]);

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('page', page.toString());
    urlSearchParams.set('pageSize', pageSize.toString());
    urlSearchParams.set('searchText', searchText);

    const response = await request(app.getHttpServer()).get(`/user?${urlSearchParams}`);

    expect(findAndCount).toHaveBeenCalledTimes(1);
    expect(findAndCount).toHaveBeenNthCalledWith(1, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: [
        {
          handle: ILike(`%${searchText}%`)
        },
        {
          email: ILike(`%${searchText}%`)
        }
      ]
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      results: [
        instanceToPlain(user)
      ],
      total
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql query systems', async (): Promise<void> => {
    const page = 2;
    const pageSize = 20;
    const searchText = '1 User';
    const total = 1;
    const user = validatePayload({
      id: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
      handle: 'Test1 User1',
      email: 'test1.user1@example.com',
      passwordHash: hashSync('Test1User1!')
    }, UserEntity);

    findAndCount.mockResolvedValueOnce([
      [
        user
      ],
      total
    ]);

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('page', page.toString());
    urlSearchParams.set('pageSize', pageSize.toString());
    urlSearchParams.set('searchText', searchText);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($filters: SearchUsersPayload!) { users(filters: $filters) { results { id handle email } total } }',
      variables: {
        filters: {
          page,
          pageSize,
          searchText
        }
      }
    });

    expect(findAndCount).toHaveBeenCalledTimes(1);
    expect(findAndCount).toHaveBeenNthCalledWith(1, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: [
        {
          handle: ILike(`%${searchText}%`)
        },
        {
          email: ILike(`%${searchText}%`)
        }
      ]
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        users: {
          results: [
            instanceToPlain(user)
          ],
          total
        }
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
