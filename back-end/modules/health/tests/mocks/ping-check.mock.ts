import { HealthIndicatorResult, TypeOrmHealthIndicator, TypeOrmPingCheckSettings } from '@nestjs/terminus';

export const pingCheckMock = (): jest.SpyInstance<Promise<HealthIndicatorResult>, [key: string, options?: TypeOrmPingCheckSettings], any> => {
  const pingCheck = jest.spyOn(TypeOrmHealthIndicator.prototype, 'pingCheck');

  afterEach((): void => {
    pingCheck.mockReset();
  });

  afterAll((): void => {
    pingCheck.mockRestore();
  });

  return pingCheck;
};
