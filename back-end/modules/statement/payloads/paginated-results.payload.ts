import { StatementEntity } from '@/statement/statement.entity';
import { Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { StatementPayload } from './statement.payload';

export class PaginatedResultsPayload {
  @IsInt()
  @Min(0)
  total: number;
  @IsArray()
  @ValidateNested({
    each: true
  })
  @Type((): typeof StatementPayload => {
    return StatementPayload;
  })
  results: StatementPayload[];

  constructor(total: number, results: StatementEntity[]) {
    this.total = total;
    this.results = results.map((result: StatementEntity): StatementPayload => {
      return new StatementPayload(result);
    });
  }
};
