import { registerEnumType } from '@nestjs/graphql';

export enum ComponentType {
  database = 'database'
};

registerEnumType(ComponentType, {
  name: 'ComponentType'
});
