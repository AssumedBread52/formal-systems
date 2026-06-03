import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayUnique, IsArray, IsEnum, IsInt, IsUUID, Min } from 'class-validator';

@InputType()
export class SearchHypothesesPayload {
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
  public readonly includeExpressionIds: string[] = [];
  @ArrayUnique()
  @Field((): [typeof String] => {
    return [String];
  })
  @IsArray()
  @IsUUID('all', {
    each: true
  })
  public readonly excludeExpressionIds: string[] = [];
  @ArrayMaxSize(Reflect.ownKeys(HypothesisType).length)
  @ArrayUnique()
  @Field((): [typeof HypothesisType] => {
    return [HypothesisType];
  })
  @IsArray()
  @IsEnum(HypothesisType, {
    each: true
  })
  public readonly types: HypothesisType[] = [];
};
