import { Abortable } from 'events';
import { ObjectEncodingOptions, OpenMode, PathLike } from 'fs';
import * as fsPromises from 'fs/promises';

export const readFileMock = (): jest.SpyInstance<Promise<string | Buffer<ArrayBufferLike>>, [path: PathLike | fsPromises.FileHandle, options?: (ObjectEncodingOptions & Abortable & { flag?: OpenMode | undefined; }) | BufferEncoding | null | undefined], any> => {
  const readFile = jest.spyOn(fsPromises, 'readFile');

  beforeEach((): void => {
    readFile.mockReset();
  });

  afterAll((): void => {
    readFile.mockRestore();
  });

  return readFile;
};
