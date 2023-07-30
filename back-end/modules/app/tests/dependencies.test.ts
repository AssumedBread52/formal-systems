import { AppModule } from '@/app/app.module';
import { expectCorrectResponse } from '@/common/tests/helpers/expectCorrectResponse';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { readFileSync } from 'fs';
import * as request from 'supertest';

describe('Dependencies', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule
      ]
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  it('succeeds in returning the dependencies with their respective versions', async (): Promise<void> => {
    const response = await request(app.getHttpServer()).get('/app/dependencies');

    const { dependencies } = JSON.parse(readFileSync(process.env.npm_package_json!, 'utf-8'));

    expectCorrectResponse(response, HttpStatus.OK, dependencies);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
