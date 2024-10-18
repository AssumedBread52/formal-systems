import { MongoRepository } from 'typeorm';

export const findOneByMock = (): jest.SpyInstance<Promise<any>, [where: any], any> => {
  const findOneBy = jest.spyOn(MongoRepository.prototype, 'findOneBy');

  beforeEach((): void => {
    findOneBy.mockReset();
  });

  afterAll((): void => {
    findOneBy.mockRestore();
  });

  return findOneBy;
};
