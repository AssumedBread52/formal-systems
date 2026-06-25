import { buildQueryResult } from '@/common/tests/helpers/build-query-result';
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
    query.mockResolvedValueOnce(buildQueryResult([
      {
        id: 1,
        timestamp: 1,
        name: 'AddUsersTable0000000000001'
      },
      {
        id: 2,
        timestamp: 2,
        name: 'AddSystemsTable0000000000002'
      },
      {
        id: 3,
        timestamp: 3,
        name: 'AddSymbolType0000000000003'
      },
      {
        id: 4,
        timestamp: 4,
        name: 'AddSymbolsTable0000000000004'
      },
      {
        id: 5,
        timestamp: 5,
        name: 'AddExpressionsTable0000000000005'
      },
      {
        id: 6,
        timestamp: 6,
        name: 'AddExpressionTokensTable0000000000006'
      },
      {
        id: 7,
        timestamp: 7,
        name: 'AddStatementsTable0000000000007'
      },
      {
        id: 8,
        timestamp: 8,
        name: 'AddHypothesisType0000000000008'
      },
      {
        id: 9,
        timestamp: 9,
        name: 'AddStatementHypothesesTable0000000000009'
      },
      {
        id: 10,
        timestamp: 10,
        name: 'AddStatementDistinctVariablePairsTable0000000000010'
      },
      {
        id: 11,
        timestamp: 11,
        name: 'AddProofsTable0000000000011'
      },
      {
        id: 12,
        timestamp: 12,
        name: 'AddProofStepsTable0000000000012'
      },
      {
        id: 13,
        timestamp: 13,
        name: 'AddProofStepSubstitutionsTable0000000000013'
      },
      {
        id: 14,
        timestamp: 14,
        name: 'AddProofStepReferencesTable0000000000014'
      }
    ]));
    query.mockResolvedValueOnce([]);
    queryRunnerConnect.mockResolvedValueOnce(undefined);
  });

  beforeEach((): void => {
    query.mockClear();
  });

  return query;
};
