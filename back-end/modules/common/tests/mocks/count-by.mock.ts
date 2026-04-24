import { FindOptionsWhere, Repository } from 'typeorm';

export const countByMock = (): jest.SpyInstance<Promise<number>, [where: FindOptionsWhere<any> | FindOptionsWhere<any>[]], any> => {
  const countBy = jest.spyOn(Repository.prototype, 'countBy');

  beforeEach((): void => {
    countBy.mockReset();
  });

  afterAll((): void => {
    countBy.mockRestore();
  });

  return countBy;
};
