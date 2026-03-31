import { FindManyOptions, Repository } from 'typeorm';

export const findAndCountMock = (): jest.SpyInstance<Promise<[any[], number]>, [options?: FindManyOptions<any> | undefined], any> => {
  const findAndCount = jest.spyOn(Repository.prototype, 'findAndCount');

  beforeEach((): void => {
    findAndCount.mockReset();
  });

  afterAll((): void => {
    findAndCount.mockRestore();
  });

  return findAndCount;
};
