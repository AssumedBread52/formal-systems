import { registerEnumType } from '@nestjs/graphql';

export enum HealthStatus {
  down = 'down',
  up = 'up'
};

registerEnumType(HealthStatus, {
  name: 'HealthStatus'
});
