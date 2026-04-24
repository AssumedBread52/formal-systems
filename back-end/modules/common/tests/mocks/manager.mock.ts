import { EntityManager, Repository } from 'typeorm';

export const managerMock = (): jest.Mock<EntityManager, [], any> => {
  const entityManager = Reflect.construct(EntityManager, []);
  const manager = jest.fn((): EntityManager => {
    return entityManager;
  });

  Reflect.defineProperty(Repository.prototype, 'manager', {
    get: manager,
    set: (): void => {
    },
    configurable: true
  });

  beforeEach((): void => {
    manager.mockClear();
  });

  afterAll((): void => {
    Reflect.deleteProperty(Repository.prototype, 'manager');
  });

  return manager;
};
