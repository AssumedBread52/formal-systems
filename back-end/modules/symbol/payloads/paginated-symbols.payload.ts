import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginatedSymbolsPayload {
  @Field((): [typeof SymbolEntity] => {
    return [SymbolEntity];
  })
  public readonly results: SymbolEntity[];
  @Field((): typeof Int => {
    return Int;
  })
  public readonly total: number;

  public constructor(symbols: SymbolEntity[], total: number) {
    this.results = symbols;
    this.total = total;
  }
};
