import { registerEnumType } from '@nestjs/graphql';

export enum StatusType {
  down = 'down',
  up = 'up'
};

registerEnumType(StatusType, {
  name: 'StatusType'
});
