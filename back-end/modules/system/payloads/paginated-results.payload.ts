import { SystemEntity } from '@/system/system.entity';
import { Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { SystemPayload } from './system.payload';

export class PaginatedResultsPayload {
  @IsInt()
  @Min(0)
  total: number;
  @IsArray()
  @ValidateNested({
    each: true
  })
  @Type((): typeof SystemPayload => {
    return SystemPayload;
  })
  results: SystemPayload[];

  constructor(total: number, results: SystemEntity[]) {
    this.total = total;
    this.results = results.map((result: SystemEntity): SystemPayload => {
      return new SystemPayload(result);
    });
  }
};
