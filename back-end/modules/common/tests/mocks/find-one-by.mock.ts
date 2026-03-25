import { FindOptionsWhere, Repository } from 'typeorm';

export const findOneByMock = (): jest.SpyInstance<Promise<any>, [where: FindOptionsWhere<any> | FindOptionsWhere<any>[]], any> => {
  const findOneBy = jest.spyOn(Repository.prototype, 'findOneBy');

  beforeEach((): void => {
    findOneBy.mockReset();
  });

  afterAll((): void => {
    findOneBy.mockRestore();
  });

  return findOneBy;
};
