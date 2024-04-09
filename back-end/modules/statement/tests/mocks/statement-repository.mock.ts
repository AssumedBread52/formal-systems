import { StatementEntity } from '@/statement/statement.entity';

export class StatementRepositoryMock {
  findOneBy = jest.fn();

  save = jest.fn((statement: StatementEntity): StatementEntity => {
    return statement;
  });
};
