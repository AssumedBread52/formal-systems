import { registerEnumType } from '@nestjs/graphql';

export enum ExpressionType {
  constant_variable_pair = 'constant_variable_pair',
  constant_prefixed = 'constant_prefixed',
  standard = 'standard'
};

registerEnumType(ExpressionType, {
  name: 'ExpressionType'
});
