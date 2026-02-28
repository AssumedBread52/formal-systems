import { ExpressionType } from '@/expression/enums/expression-type.enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayUnique, IsArray, IsEnum, IsInt, IsMongoId, Min } from 'class-validator';

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
  @IsMongoId({
    each: true
  })
  public readonly mustIncludeSymbolIds: string[] = [];
  @ArrayUnique()
  @Field((): [typeof String] => {
    return [String];
  })
  @IsArray()
  @IsMongoId({
    each: true
  })
  public readonly mayIncludeSymbolIds: string[] = [];
  @ArrayMaxSize(Object.keys(ExpressionType).length)
  @ArrayUnique()
  @Field((): [typeof ExpressionType] => {
    return [ExpressionType];
  })
  @IsArray()
  @IsEnum(ExpressionType, {
    each: true
  })
  public readonly types: ExpressionType[] = [];
};
