import { Type } from 'class-transformer';
import { IsArray, IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

export class MongoSearchPayload {
  @IsInt()
  @Min(0)
  @Type((): typeof Number => {
    return Number;
  })
  skip: number = 0;
  @IsInt()
  @Min(0)
  @Type((): typeof Number => {
    return Number;
  })
  take: number = 0;
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
