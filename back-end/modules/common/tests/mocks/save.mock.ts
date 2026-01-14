import { MongoRepository, SaveOptions } from 'typeorm';

export const saveMock = (): jest.SpyInstance<Promise<any>, [entity: any, options?: SaveOptions | undefined], any> => {
  const save = jest.spyOn(MongoRepository.prototype, 'save');

  beforeEach((): void => {
    save.mockReset();
  });

  afterAll((): void => {
    save.mockRestore();
  });

  return save;
};
