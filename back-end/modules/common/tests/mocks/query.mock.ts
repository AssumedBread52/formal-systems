import migrations from '@/migration/migrations';
import { Type } from '@nestjs/common';
import { QueryResult } from 'typeorm';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner';

export const queryMock = (): jest.SpyInstance<Promise<any>, [query: string, parameters?: any[] | undefined, useStructuredResult?: boolean | undefined], any> => {
  const afterConnect = jest.spyOn(PostgresDriver.prototype, 'afterConnect');
  const disconnect = jest.spyOn(PostgresDriver.prototype, 'disconnect');
  const driverConnect = jest.spyOn(PostgresDriver.prototype, 'connect');
  const query = jest.spyOn(PostgresQueryRunner.prototype, 'query');
  const queryRunnerConnect = jest.spyOn(PostgresQueryRunner.prototype, 'connect');

  beforeAll((): void => {
    afterConnect.mockResolvedValue();
    disconnect.mockResolvedValue();
    driverConnect.mockResolvedValue();
    queryRunnerConnect.mockResolvedValue(undefined);

    const executedMigrations = new QueryResult();

    executedMigrations.records = Object.values(migrations).map((migration: Type, index: number): Record<string, unknown> => {
      return {
        id: index + 1,
        timestamp: index + 1,
        name: migration.name
      };
    });
    executedMigrations.raw = executedMigrations.records;

    query.mockResolvedValueOnce([]);
    query.mockResolvedValueOnce([
      {
        current_schema: 'public'
      }
    ]);
    query.mockResolvedValueOnce([]);
    query.mockResolvedValueOnce([]);
    query.mockResolvedValueOnce(executedMigrations);
    query.mockResolvedValueOnce([]);
  });

  beforeEach((): void => {
    query.mockReset();
  });

  return query;
};
