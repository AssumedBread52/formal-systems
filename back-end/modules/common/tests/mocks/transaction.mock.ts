import { EntityManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel.js';

export const transactionMock = (): jest.SpyInstance<Promise<unknown>, [isolationLevel: IsolationLevel, runInTransaction: (entityManager: EntityManager) => Promise<unknown>], any> => {
  const transaction = jest.spyOn(EntityManager.prototype, 'transaction');

  transaction.mockImplementation((_: IsolationLevel, runInTransaction: (entityManager: EntityManager) => Promise<unknown>): Promise<unknown> => {
    return runInTransaction(Reflect.construct(EntityManager, []));
  });

  beforeEach((): void => {
    transaction.mockClear();
  });

  afterAll((): void => {
    transaction.mockRestore();
  });

  return transaction;
};
