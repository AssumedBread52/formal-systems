import { registerEnumType } from '@nestjs/graphql';

export enum DependencyType {
  development = 'development',
  operational = 'operational'
};

registerEnumType(DependencyType, {
  name: 'DependencyType'
});
