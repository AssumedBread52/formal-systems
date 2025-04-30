import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, Min } from 'class-validator';

export class DefaultSearchPayload {
  @IsInt()
  @Min(1)
  @Type((): typeof Number => {
    return Number;
  })
  page: number = 1;
  @IsInt()
  @Min(1)
  @Type((): typeof Number => {
    return Number;
  })
  pageSize: number = 10;
  @IsArray()
  @IsNotEmpty({
    each: true
  })
  keywords: string[] = [];
  @IsArray()
  @IsNotEmpty({
    each: true
  })
  userIds: string[] = [];
};
