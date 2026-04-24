import { EntityManager, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

export const getRepositoryMock = (): jest.SpyInstance<Repository<ObjectLiteral>, [target: EntityTarget<ObjectLiteral>], any> => {
  const getRepository = jest.spyOn(EntityManager.prototype, 'getRepository');

  getRepository.mockReturnValue(Reflect.construct(Repository, []));

  beforeEach((): void => {
    getRepository.mockClear();
  });

  afterAll((): void => {
    getRepository.mockRestore();
  });

  return getRepository;
};
