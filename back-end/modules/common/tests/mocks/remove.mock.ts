import { RemoveOptions, Repository } from 'typeorm';

export const removeMock = (): jest.SpyInstance<Promise<any>, [entity: any, options?: RemoveOptions | undefined], any> => {
  const remove = jest.spyOn(Repository.prototype, 'remove');

  beforeEach((): void => {
    remove.mockReset();
  });

  afterAll((): void => {
    remove.mockRestore();
  });

  return remove;
};
