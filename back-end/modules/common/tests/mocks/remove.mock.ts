import { MongoRepository, RemoveOptions } from 'typeorm';

export const removeMock = (): jest.SpyInstance<Promise<any>, [entity: any, options?: RemoveOptions], any> => {
  const remove = jest.spyOn(MongoRepository.prototype, 'remove');

  beforeEach((): void => {
    remove.mockReset();
  });

  afterAll((): void => {
    remove.mockRestore();
  });

  return remove;
};
