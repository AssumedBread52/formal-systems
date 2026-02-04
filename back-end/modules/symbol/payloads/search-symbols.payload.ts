import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayUnique, IsArray, IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';

@InputType()
export class SearchSymbolsPayload {
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(1)
  @Type((): typeof Number => {
    return Number;
  })
  page: number = 1;
  @Field((): typeof Int => {
    return Int;
  })
  @IsInt()
  @Min(1)
  @Type((): typeof Number => {
    return Number;
  })
  count: number = 10;
  @ArrayUnique()
  @Field((): [typeof String] => {
    return [String];
  })
  @IsArray()
  @IsNotEmpty({
    each: true
  })
  keywords: string[] = [];
  @ArrayMaxSize(Object.keys(SymbolType).length)
  @ArrayUnique()
  @Field((): [typeof SymbolType] => {
    return [SymbolType];
  })
  @IsArray()
  @IsEnum(SymbolType, {
    each: true
  })
  types: SymbolType[] = [];
};
