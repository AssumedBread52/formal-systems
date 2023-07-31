import { AppModule } from '@/app/app.module';
import { expectCorrectResponse } from '@/common/tests/helpers/expect-correct-response';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

describe('Status Check', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    const testingModule = await Test.createTestingModule({
      imports: [
        AppModule
      ]
    }).compile();

    app = testingModule.createNestApplication();

    await app.init();
  });

  it('succeeds in indicating the server is up and running', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/app/status');

    expectCorrectResponse(response, HttpStatus.NO_CONTENT, {});
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
