import { createTestApp } from '@/common/tests/helpers/create-test-app';
import { getOrThrowMock } from '@/common/tests/mocks/get-or-throw.mock';
import { queryMock } from '@/common/tests/mocks/query.mock';
import { readFileMock } from '@/common/tests/mocks/read-file.mock';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

describe('Read Dependencies', (): void => {
  const getOrThrow = getOrThrowMock();
  const query = queryMock();
  const readFile = readFileMock();
  let app: NestExpressApplication;

  const packageLock = (): string => {
    return JSON.stringify({
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
  };

  beforeAll(async (): Promise<void> => {
    app = await createTestApp();
  });

  describe('GraphQL POST /graphql query dependencies', (): void => {
    it('returns the application dependencies', async (): Promise<void> => {
      readFile.mockResolvedValueOnce(packageLock());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { dependencies { name version type } }'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
      expect(response.body).toStrictEqual({
        data: {
          dependencies: [
            {
              name: 'library1',
              version: '1.2.3',
              type: 'operational'
            },
            {
              name: 'library2',
              version: '2.3.4',
              type: 'operational'
            },
            {
              name: 'testLibrary1',
              version: '3.4.5',
              type: 'development'
            },
            {
              name: 'testLibrary2',
              version: '4.5.6',
              type: 'development'
            }
          ]
        }
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when there are no dependencies', async (): Promise<void> => {
      readFile.mockResolvedValueOnce(JSON.stringify({
        packages: {
          '': {
            dependencies: {},
            devDependencies: {}
          }
        }
      }));

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { dependencies { name version type } }'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Not Found',
                message: 'Dependencies not found',
                statusCode: HttpStatus.NOT_FOUND
              },
              status: HttpStatus.NOT_FOUND
            },
            locations: [
              {
                column: 9,
                line: 1
              }
            ],
            message: 'Dependencies not found',
            path: [
              'dependencies'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('reports an error when reading the dependencies fails', async (): Promise<void> => {
      readFile.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).post('/graphql').send({
        query: 'query { dependencies { name version type } }'
      });

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
      expect(response.body).toStrictEqual({
        data: null,
        errors: [
          {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              originalError: {
                error: 'Internal Server Error',
                message: 'Reading application dependencies failed',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
              },
              status: HttpStatus.INTERNAL_SERVER_ERROR
            },
            locations: [
              {
                column: 9,
                line: 1
              }
            ],
            message: 'Reading application dependencies failed',
            path: [
              'dependencies'
            ]
          }
        ]
      });
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('REST GET /dependency', (): void => {
    it('returns the application dependencies', async (): Promise<void> => {
      readFile.mockResolvedValueOnce(packageLock());

      const response = await request(app.getHttpServer()).get('/dependency');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
      expect(response.body).toStrictEqual([
        {
          name: 'library1',
          version: '1.2.3',
          type: 'operational'
        },
        {
          name: 'library2',
          version: '2.3.4',
          type: 'operational'
        },
        {
          name: 'testLibrary1',
          version: '3.4.5',
          type: 'development'
        },
        {
          name: 'testLibrary2',
          version: '4.5.6',
          type: 'development'
        }
      ]);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('responds with 404 when there are no dependencies', async (): Promise<void> => {
      readFile.mockResolvedValueOnce(JSON.stringify({
        packages: {
          '': {
            dependencies: {},
            devDependencies: {}
          }
        }
      }));

      const response = await request(app.getHttpServer()).get('/dependency');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
      expect(response.body).toStrictEqual({
        error: 'Not Found',
        message: 'Dependencies not found',
        statusCode: HttpStatus.NOT_FOUND
      });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('responds with 500 when reading the file fails', async (): Promise<void> => {
      readFile.mockRejectedValueOnce(new Error());

      const response = await request(app.getHttpServer()).get('/dependency');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading application dependencies failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the file is not valid JSON', async (): Promise<void> => {
      readFile.mockResolvedValueOnce('not valid json');

      const response = await request(app.getHttpServer()).get('/dependency');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading application dependencies failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the packages data is missing', async (): Promise<void> => {
      readFile.mockResolvedValueOnce(JSON.stringify({}));

      const response = await request(app.getHttpServer()).get('/dependency');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading application dependencies failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when the root packages data is missing', async (): Promise<void> => {
      readFile.mockResolvedValueOnce(JSON.stringify({
        packages: {}
      }));

      const response = await request(app.getHttpServer()).get('/dependency');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading application dependencies failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when a package\'s details are missing', async (): Promise<void> => {
      readFile.mockResolvedValueOnce(JSON.stringify({
        packages: {
          '': {
            dependencies: {
              library1: '^1.2.3'
            }
          }
        }
      }));

      const response = await request(app.getHttpServer()).get('/dependency');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading application dependencies failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('responds with 500 when a package\'s version is missing', async (): Promise<void> => {
      readFile.mockResolvedValueOnce(JSON.stringify({
        packages: {
          '': {
            dependencies: {
              library1: '^1.2.3'
            }
          },
          'node_modules/library1': {}
        }
      }));

      const response = await request(app.getHttpServer()).get('/dependency');

      expect(getOrThrow).toHaveBeenCalledTimes(0);
      expect(query).toHaveBeenCalledTimes(0);
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenNthCalledWith(1, '/app/package-lock.json', 'utf-8');
      expect(response.body).toStrictEqual({
        error: 'Internal Server Error',
        message: 'Reading application dependencies failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  afterAll(async (): Promise<void> => {
    await app.close();

    jest.restoreAllMocks();
  });
});
