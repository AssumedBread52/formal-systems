import { FilterOperators, FindManyOptions, MongoRepository } from 'typeorm';

export const findMock = (): jest.SpyInstance<Promise<any[]>, [options?: FindManyOptions<any> | Partial<any> | FilterOperators<any> | undefined], any> => {
  const find = jest.spyOn(MongoRepository.prototype, 'find');

  beforeEach((): void => {
    find.mockReset();
  });

  afterAll((): void => {
    find.mockRestore();
  });

  return find;
};
