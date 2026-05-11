import { registerEnumType } from '@nestjs/graphql';

export enum HypothesisType {
  type = 'type',
  logic = 'logic'
};

registerEnumType(HypothesisType, {
  name: 'HypothesisType'
});
