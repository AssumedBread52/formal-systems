import { HealthIndicatorResult } from '@nestjs/terminus';

export class TypeOrmHealthIndicatorMock {
  pingCheck = jest.fn((key: string): HealthIndicatorResult => {
    return {
      [key]: {
        status: 'up'
      }
    };
  });
};
