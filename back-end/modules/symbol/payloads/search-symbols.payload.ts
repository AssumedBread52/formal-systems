import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';

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
  @Field((): [typeof String] => {
    return [String];
  })
  @IsArray()
  @IsNotEmpty({
    each: true
  })
  keywords: string[] = [];
  @ArrayMaxSize(Object.keys(SymbolType).length)
  @Field((): [typeof SymbolType] => {
    return [SymbolType];
  })
  @IsEnum(SymbolType, {
    each: true
  })
  types: SymbolType[] = [];
};
