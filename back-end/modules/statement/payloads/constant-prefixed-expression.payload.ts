import { ArrayMinSize } from 'class-validator';
import { ExpressionPayload } from './expression.payload';

export class ConstantPrefixedExpressionPayload extends ExpressionPayload {
  @ArrayMinSize(1)
  public override symbolIds: [string, ...string[]] = [''];

  public get prefixedConstantSymbolId(): string {
    return this.symbolIds[0];
  }

  public get suffixedExpressionSymbolIds(): string[] {
    return this.symbolIds.slice(1);
  }
};
