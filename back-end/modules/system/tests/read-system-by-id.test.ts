import { validatePayload } from '@/common/helpers/validate-payload';
import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { findOneByMock } from '@/common/tests/mocks/find-one-by.mock';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { SystemEntity } from '@/system/entities/system.entity';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import request from 'supertest';

describe('Read System by ID', (): void => {
  const findOneBy = findOneByMock();
  const getOrThrow = getOrThrowMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /system/:systemId', async (): Promise<void> => {
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const system = validatePayload({
      id: systemId,
      ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
      name: 'TestSystem1',
      description: 'Test System 1'
    }, SystemEntity);

    findOneBy.mockResolvedValueOnce(system);

    const response = await request(app.getHttpServer()).get(`/system/${systemId}`);

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual(instanceToPlain(system));
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql query system', async (): Promise<void> => {
    const systemId = '1222051d-2638-424f-a193-68b26615345a';
    const system = validatePayload({
      id: systemId,
      ownerUserId: 'f9c7d036-e7e1-4775-b33c-43138e506e82',
      name: 'TestSystem1',
      description: 'Test System 1'
    }, SystemEntity);

    findOneBy.mockResolvedValueOnce(system);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query ($systemId: String!) { system(systemId: $systemId) { id ownerUserId name description } }',
      variables: {
        systemId
      }
    });

    expect(findOneBy).toHaveBeenCalledTimes(1);
    expect(findOneBy).toHaveBeenNthCalledWith(1, {
      id: systemId
    });
    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(response.body).toStrictEqual({
      data: {
        system: instanceToPlain(system)
      }
    });
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
