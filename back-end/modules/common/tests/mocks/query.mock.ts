import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
import migrations from '@/migration/migrations';
import { BaseMigration } from '@/migration/migrations/base.migration';
import { Type } from '@nestjs/common';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner';

export const queryMock = (): jest.SpyInstance<Promise<any>, [query: string, parameters?: any[] | undefined, useStructuredResult?: boolean | undefined], any> => {
  const afterConnect = jest.spyOn(PostgresDriver.prototype, 'afterConnect');
  const disconnect = jest.spyOn(PostgresDriver.prototype, 'disconnect');
  const driverConnect = jest.spyOn(PostgresDriver.prototype, 'connect');
  const query = jest.spyOn(PostgresQueryRunner.prototype, 'query');
  const queryRunnerConnect = jest.spyOn(PostgresQueryRunner.prototype, 'connect');

  beforeAll((): void => {
    afterConnect.mockResolvedValueOnce();
    disconnect.mockResolvedValueOnce();
    driverConnect.mockResolvedValueOnce();
    query.mockResolvedValueOnce([]);
    query.mockResolvedValueOnce([
      {
        current_schema: 'public'
      }
    ]);
    query.mockResolvedValueOnce([
      {
        table_catalog: 'postgres',
        table_schema: 'public',
        table_name: 'migrations',
        table_type: 'BASE TABLE',
        self_referencing_column_name: '',
        reference_generation: '',
        user_defined_type_catalog: '',
        user_defined_type_schema: '',
        user_defined_type_name: '',
        is_insertable_into: 'YES',
        is_typed: 'NO',
        commit_action: ''
      }
    ]);
    query.mockResolvedValueOnce(buildQueryResult(Object.entries(migrations).map((migrationEntry: [string, Type<BaseMigration>], index: number): Record<string, unknown> => {
      const [migrationName] = migrationEntry;

      return {
        id: index + 1,
        timestamp: index + 1,
        name: migrationName
      };
    })));
    query.mockResolvedValueOnce([]);
    queryRunnerConnect.mockResolvedValueOnce(undefined);
  });

  beforeEach((): void => {
    query.mockClear();
  });

  return query;
};
