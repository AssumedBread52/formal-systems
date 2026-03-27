import { Repository, SaveOptions } from 'typeorm';

export const saveMock = (): jest.SpyInstance<Promise<any>, [entity: any, options?: SaveOptions | undefined], any> => {
  const save = jest.spyOn(Repository.prototype, 'save');

  beforeEach((): void => {
    save.mockReset();
  });

  afterAll((): void => {
    save.mockRestore();
  });

  return save;
};
