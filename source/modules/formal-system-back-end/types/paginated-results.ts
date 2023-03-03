import { IsArray, IsNumber, ValidateNested } from 'class-validator';

export class PaginatedResults<ResultType> {
  @IsNumber()
  public total: number = 0;
  @IsArray()
  @ValidateNested({ each: true })
  public results: ResultType[] = [];
};
