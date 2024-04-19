import { StatementEntity } from '@/statement/statement.entity';

export class StatementRepositoryMock {
  findOneBy = jest.fn();

  remove = jest.fn((statement: StatementEntity): StatementEntity => {
    return statement;
  });

  save = jest.fn((statement: StatementEntity): StatementEntity => {
    return statement;
  });
};
