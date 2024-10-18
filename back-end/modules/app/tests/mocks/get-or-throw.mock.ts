import { ConfigGetOptions, ConfigService } from '@nestjs/config';

export const getOrThrowMock = (): jest.SpyInstance<unknown, [propertyPath: never, defaultValue: unknown, options: ConfigGetOptions], any> => {
  const getOrThrow = jest.spyOn(ConfigService.prototype, 'getOrThrow');

  beforeAll((): void => {
    getOrThrow.mockReturnValueOnce('test secret');
    getOrThrow.mockReturnValueOnce('1s');
    getOrThrow.mockReturnValueOnce('test secret');
  });

  beforeEach((): void => {
    getOrThrow.mockReset();
  });

  afterAll((): void => {
    getOrThrow.mockRestore();
  });

  return getOrThrow;
};
