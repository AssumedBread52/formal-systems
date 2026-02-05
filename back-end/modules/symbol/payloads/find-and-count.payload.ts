import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { ArrayMaxSize, ArrayUnique, IsArray, IsEnum, IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

export class FindAndCountPayload {
  @IsInt()
  @Min(0)
  public readonly skip: number = 0;
  @IsInt()
  @Min(0)
  public readonly take: number = 0;
  @IsMongoId()
  public readonly systemId: string = '';
  @ArrayUnique()
  @IsArray()
  @IsNotEmpty({
    each: true
  })
  public readonly keywords: string[] = [];
  @ArrayMaxSize(Object.keys(SymbolType).length)
  @ArrayUnique()
  @IsArray()
  @IsEnum(SymbolType, {
    each: true
  })
  public readonly types: SymbolType[] = [];
};
