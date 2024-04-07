import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';

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
  @ArrayMaxSize(Object.keys(SymbolType).length)
  @IsEnum(SymbolType, {
    each: true
  })
  types: SymbolType[] = [];
};
