import { MongoRepository } from 'typeorm';
import { MongoFindManyOptions } from 'typeorm/find-options/mongodb/MongoFindManyOptions';

export const findAndCountMock = (): jest.SpyInstance<Promise<[any[], number]>, [options?: MongoFindManyOptions<any> | undefined], any> => {
  const findAndCount = jest.spyOn(MongoRepository.prototype, 'findAndCount');

  beforeEach((): void => {
    findAndCount.mockReset();
  });

  afterAll((): void => {
    findAndCount.mockRestore();
  });

  return findAndCount;
};
