import { SystemEntity } from '@/system/system.entity';
import { SystemModule } from '@/system/system.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SystemRepositoryMock } from './mocks/system-repository.mock';

describe('Test the status', (): void => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        SystemModule
      ]
    }).overrideProvider(getRepositoryToken(SystemEntity)).useClass(SystemRepositoryMock).compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  it('', (): void => {
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
