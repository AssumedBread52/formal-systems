import { ConfigGetOptions, ConfigService } from '@nestjs/config';

export const getOrThrowMock = (): jest.SpyInstance<unknown, [propertyPath: never, defaultValue: unknown, options: ConfigGetOptions], any> => {
  const getOrThrow = jest.spyOn(ConfigService.prototype, 'getOrThrow');

  beforeAll((): void => {
    getOrThrow.mockReturnValueOnce('test secret');
    getOrThrow.mockReturnValueOnce('5');
    getOrThrow.mockReturnValueOnce('postgres');
    getOrThrow.mockReturnValueOnce('database_scheme');
    getOrThrow.mockReturnValueOnce('database_username');
    getOrThrow.mockReturnValueOnce('database_password');
    getOrThrow.mockReturnValueOnce('database_host');
    getOrThrow.mockReturnValueOnce(5432);
    getOrThrow.mockReturnValueOnce('database_name');
    getOrThrow.mockReturnValueOnce('test secret');
  });

  beforeEach((): void => {
    getOrThrow.mockClear();
  });

  return getOrThrow;
};
