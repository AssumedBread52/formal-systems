import { registerEnumType } from '@nestjs/graphql';

export enum SymbolType {
  constant = 'constant',
  variable = 'variable'
};

registerEnumType(SymbolType, {
  name: 'SymbolType'
});
