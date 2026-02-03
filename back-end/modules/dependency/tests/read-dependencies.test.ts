import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { readFileMock } from './mocks/read-file.mock';

describe('Read Dependencies', (): void => {
  const getOrThrow = getOrThrowMock();
  const readFile = readFileMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /dependency', async (): Promise<void> => {
    const dependencyData = {
      packages: {
        '': {
          dependencies: {
            library1: '^1.2.3',
            library2: '^2.3.4'
          },
          devDependencies: {
            testLibrary1: '^3.4.5',
            testLibrary2: '^4.5.6'
          }
        },
        'node_modules/library1': {
          version: '1.2.3'
        },
        'node_modules/library2': {
          version: '2.3.4'
        },
        'node_modules/testLibrary1': {
          version: '3.4.5'
        },
        'node_modules/testLibrary2': {
          version: '4.5.6'
        }
      }
    };

    const readFileResponse = JSON.stringify(dependencyData);

    readFile.mockResolvedValueOnce(readFileResponse);

    const response = await request(app.getHttpServer()).get('/dependency');

    const { body } = response;

    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
    expect(body).toStrictEqual([
      {
        name: 'library1',
        type: 'operational',
        version: '1.2.3'
      },
      {
        name: 'library2',
        type: 'operational',
        version: '2.3.4'
      },
      {
        name: 'testLibrary1',
        type: 'development',
        version: '3.4.5'
      },
      {
        name: 'testLibrary2',
        type: 'development',
        version: '4.5.6'
      }
    ]);
  });

  it('POST /graphql query dependencies', async (): Promise<void> => {
    const dependencyData = {
      packages: {
        '': {
          dependencies: {
            library1: '^1.2.3',
            library2: '^2.3.4'
          },
          devDependencies: {
            testLibrary1: '^3.4.5',
            testLibrary2: '^4.5.6'
          }
        },
        'node_modules/library1': {
          version: '1.2.3'
        },
        'node_modules/library2': {
          version: '2.3.4'
        },
        'node_modules/testLibrary1': {
          version: '3.4.5'
        },
        'node_modules/testLibrary2': {
          version: '4.5.6'
        }
      }
    };

    const readFileResponse = JSON.stringify(dependencyData);

    readFile.mockResolvedValueOnce(readFileResponse);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query dependencies { dependencies { name type version } }'
    });

    const { body } = response;

    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
    expect(body).toStrictEqual({
      data: {
        dependencies: [
          {
            name: 'library1',
            type: 'operational',
            version: '1.2.3'
          },
          {
            name: 'library2',
            type: 'operational',
            version: '2.3.4'
          },
          {
            name: 'testLibrary1',
            type: 'development',
            version: '3.4.5'
          },
          {
            name: 'testLibrary2',
            type: 'development',
            version: '4.5.6'
          }
        ]
      }
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
