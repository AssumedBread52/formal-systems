import { HealthIndicatorResult } from "@nestjs/terminus";

export class TypeOrmHealthIndicatorMock {
  pingCheck = jest.fn((type: string): HealthIndicatorResult => {
    return {
      [type]: {
        status: 'up'
      }
    };
  });
};
