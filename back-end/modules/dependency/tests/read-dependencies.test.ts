import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { readFileMock } from '@/common/tests/mocks/read-file.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

describe('Read Dependencies', (): void => {
  const getOrThrow = getOrThrowMock();
  const readFile = readFileMock();
  let app: NestExpressApplication;

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  it('GET /dependency', async (): Promise<void> => {
    const fileData = JSON.stringify({
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
    });

    readFile.mockResolvedValueOnce(fileData);

    const response = await request(app.getHttpServer()).get('/dependency');

    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
    expect(response.body).toStrictEqual([
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
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  it('POST /graphql query dependencies', async (): Promise<void> => {
    const fileData = JSON.stringify({
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
    });

    readFile.mockResolvedValueOnce(fileData);

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: 'query { dependencies { name type version } }'
    });

    expect(getOrThrow).toHaveBeenCalledTimes(0);
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
    expect(response.body).toStrictEqual({
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
    expect(response.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });
});
