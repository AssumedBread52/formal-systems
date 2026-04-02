import { PathLike } from 'fs';
import fsPromises from 'fs/promises';

export const accessMock = (): jest.SpyInstance<Promise<void>, [path: PathLike, mode?: number | undefined], any> => {
  const access = jest.spyOn(fsPromises, 'access');

  beforeEach((): void => {
    access.mockReset();
  });

  afterAll((): void => {
    access.mockRestore();
  });

  return access;
};
