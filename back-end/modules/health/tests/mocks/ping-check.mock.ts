import { HealthIndicatorResult, TypeOrmHealthIndicator, TypeOrmPingCheckSettings } from '@nestjs/terminus';

export const pingCheckMock = (): jest.SpyInstance<Promise<HealthIndicatorResult<string>>, [key: string, options?: TypeOrmPingCheckSettings | undefined], any> => {
  const pingCheck = jest.spyOn(TypeOrmHealthIndicator.prototype, 'pingCheck');

  beforeEach((): void => {
    pingCheck.mockReset();
  });

  afterAll((): void => {
    pingCheck.mockRestore();
  });

  return pingCheck;
};
