import { MongoRepository } from 'typeorm';

export const findByMock = (): jest.SpyInstance<Promise<any[]>, [where: any], any> => {
  const findBy = jest.spyOn(MongoRepository.prototype, 'findBy');

  beforeEach((): void => {
    findBy.mockReset();
  });

  afterAll((): void => {
    findBy.mockRestore();
  });

  return findBy;
};
