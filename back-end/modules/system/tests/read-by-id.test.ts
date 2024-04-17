import { createTestApp } from '@/app/tests/helpers/create-test-app';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { SystemEntity } from '@/system/system.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { SystemRepositoryMock } from './mocks/system-repository.mock';

describe('Read System by ID', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('fails with an invalid route parameter', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/system/1');

    expectCorrectResponse(response, HttpStatus.UNPROCESSABLE_ENTITY, {
      error: 'Unprocessable Entity',
      message: 'systemId should be a mongodb id',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
  });

  it('fails if the system is not found', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get(`/system/${new ObjectId()}`);

    expectCorrectResponse(response, HttpStatus.NOT_FOUND, {
      error: 'Not Found',
      message: 'System not found.',
      statusCode: HttpStatus.NOT_FOUND
    });
  });

  it('succeeds', async (): Promise<void> => {
    const system = new SystemEntity();

    const systemRepositoryMock = app.get(getRepositoryToken(SystemEntity)) as SystemRepositoryMock;

    systemRepositoryMock.findOneBy.mockReturnValueOnce(system);

    const response = await request(app.getHttpServer()).get(`/system/${system._id}`);

    expectCorrectResponse(response, HttpStatus.OK, {
      id: system._id.toString(),
      title: system.title,
      description: system.description,
      constantSymbolCount: system.constantSymbolCount,
      variableSymbolCount: system.variableSymbolCount,
      axiomCount: system.axiomCount,
      theoremCount: system.theoremCount,
      deductionCount: system.deductionCount,
      createdByUserId: system.createdByUserId.toString()
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
