import { ArrayMaxSize, ArrayMinSize, ArrayUnique } from 'class-validator';
import { ConstantPrefixedExpressionPayload } from './constant-prefixed-expression.payload';

export class ConstantVariablePairExpressionPayload extends ConstantPrefixedExpressionPayload {
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  @ArrayUnique()
  public override symbolIds: [string, string] = ['', ''];

  public get suffixedVariableSymbolId(): string {
    return this.symbolIds[1];
  }
};
