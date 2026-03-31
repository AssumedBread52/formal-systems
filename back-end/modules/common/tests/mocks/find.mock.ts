import { FindManyOptions, Repository } from 'typeorm';

export const findMock = (): jest.SpyInstance<Promise<any[]>, [options?: FindManyOptions<any> | undefined], any> => {
  const find = jest.spyOn(Repository.prototype, 'find');

  beforeEach((): void => {
    find.mockReset();
  });

  afterAll((): void => {
    find.mockRestore();
  });

  return find;
};
