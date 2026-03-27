import { FindOptionsWhere, Repository } from 'typeorm';

export const existsByMock = (): jest.SpyInstance<Promise<boolean>, [where: FindOptionsWhere<any> | FindOptionsWhere<any>[]], any> => {
  const existsBy = jest.spyOn(Repository.prototype, 'existsBy');

  beforeEach((): void => {
    existsBy.mockReset();
  });

  afterAll((): void => {
    existsBy.mockRestore();
  });

  return existsBy;
};
