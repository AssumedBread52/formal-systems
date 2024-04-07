import { StatementEntity } from '@/statement/statement.entity';

export class StatementRepositoryMock {
  save = jest.fn((statement: StatementEntity): StatementEntity => {
    return statement;
  });
};
