import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayUnique, IsArray, IsEnum, IsInt, IsString, Min } from 'class-validator';

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
  @Field((): typeof String => {
    return String;
  })
  @IsString()
  public readonly searchText: string = '';
  @ArrayMaxSize(Object.keys(SymbolType).length)
  @ArrayUnique()
  @Field((): [typeof SymbolType] => {
    return [SymbolType];
  })
  @IsArray()
  @IsEnum(SymbolType, {
    each: true
  })
  public readonly types: SymbolType[] = [];
};
