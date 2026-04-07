import { FindOptionsWhere, Repository } from 'typeorm';

export const findByMock = (): jest.SpyInstance<Promise<any[]>, [where: FindOptionsWhere<any> | FindOptionsWhere<any>[]], any> => {
  const findBy = jest.spyOn(Repository.prototype, 'findBy');

  beforeEach((): void => {
    findBy.mockReset();
  });

  afterAll((): void => {
    findBy.mockRestore();
  });

  return findBy;
};
