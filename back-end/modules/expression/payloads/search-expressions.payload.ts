import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsInt, IsUUID, Min } from 'class-validator';

@InputType()
export class SearchExpressionsPayload {
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(1)
  @Type((): typeof Number => {
    return Number;
  })
  public readonly page: number = 1;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(1)
  @Type((): typeof Number => {
    return Number;
  })
  public readonly pageSize: number = 10;
  @ArrayUnique()
  @Field((): [typeof String] => {
    return [String];
  })
  @IsArray()
  @IsUUID('all', {
    each: true
  })
  public readonly symbolIds: string[] = [];
};
