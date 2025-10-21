import { registerEnumType } from '@nestjs/graphql';

export enum ComponentType {
  database = 'database',
  file = 'file'
};

registerEnumType(ComponentType, {
  name: 'ComponentType'
});
