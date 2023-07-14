import { SymbolEntity } from '@/symbol/symbol.entity';
import { Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { SymbolPayload } from './symbol.payload';

export class PaginatedResultsPayload {
  @IsInt()
  @Min(0)
  total: number;
  @IsArray()
  @ValidateNested({
    each: true
  })
  @Type(() => SymbolPayload)
  results: SymbolPayload[];

  constructor(total: number, results: SymbolEntity[]) {
    this.total = total;
    this.results = results.map((result: SymbolEntity): SymbolPayload => {
      return new SymbolPayload(result);
    });
  }
};
