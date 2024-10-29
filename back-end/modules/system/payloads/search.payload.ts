import { Type } from 'class-transformer';
import { IsArray, IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

export class SearchPayload {
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
  count: number = 10;
  @IsArray()
  @IsNotEmpty({
    each: true
  })
  keywords: string[] = [];
  @IsArray()
  @IsMongoId({
    each: true
  })
  userIds: string[] = [];
};
