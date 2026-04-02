import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findAndCountMock } from '@/common/tests/mocks/find-and-count.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { SystemEntity } from '@/system/entities/system.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';
import { ILike, In } from 'typeorm';

describe('Read Systems', (): void => {
  const findAndCount = findAndCountMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system', async (): Promise<void> => {
    const page = 2;
    const pageSize = 20;
    const searchText = 't S';
    const total = 1;
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const system = validatePayload({
      id: '1222051d-2638-424f-a193-68b26615345a',
      ownerUserId: userId,
      name: 'TestSystem1',
      description: 'Test System 1'
    }, SystemEntity);

    findAndCount.mockResolvedValueOnce([
      [
        system
      ],
      total
    ]);

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('page', page.toString());
    urlSearchParams.set('pageSize', pageSize.toString());
    urlSearchParams.set('ownerUserIds[]', userId);
    urlSearchParams.set('searchText', searchText);

    const response = await request(app.getHttpServer()).get(`/system?${urlSearchParams}`);

    expect(findAndCount).toHaveBeenCalledTimes(1);
    expect(findAndCount).toHaveBeenNthCalledWith(1, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: [
        {
          ownerUserId: In([
            userId
          ]),
          name: ILike(`%${searchText}%`)
        },
        {
          ownerUserId: In([
            userId
          ]),
          description: ILike(`%${searchText}%`)
        }
      ]
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      results: [
        instanceToPlain(system)
      ],
      total
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql query systems', async (): Promise<void> => {
    const page = 2;
    const pageSize = 20;
    const searchText = 't S';
    const total = 1;
    const userId = 'f9c7d036-e7e1-4775-b33c-43138e506e82';
    const system = validatePayload({
      id: '1222051d-2638-424f-a193-68b26615345a',
      ownerUserId: userId,
      name: 'TestSystem1',
      description: 'Test System 1'
    }, SystemEntity);

    findAndCount.mockResolvedValueOnce([
      [
        system
      ],
      total
    ]);

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('page', page.toString());
    urlSearchParams.set('pageSize', pageSize.toString());
    urlSearchParams.set('ownerUserIds[]', userId);
    urlSearchParams.set('searchText', searchText);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($filters: SearchSystemsPayload!) { systems(filters: $filters) { results { id ownerUserId name description } total } }',
      variables: {
        filters: {
          page,
          pageSize,
          ownerUserIds: [
            userId
          ],
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
          ownerUserId: In([
            userId
          ]),
          name: ILike(`%${searchText}%`)
        },
        {
          ownerUserId: In([
            userId
          ]),
          description: ILike(`%${searchText}%`)
        }
      ]
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        systems: {
          results: [
            instanceToPlain(system)
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
