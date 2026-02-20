import { ArrayMaxSize, ArrayUnique, IsArray, IsInt, IsMongoId, Min } from 'class-validator';

export class FindAndCountPayload {
  @IsInt()
  @Min(0)
  public readonly skip: number = 0;
  @IsInt()
  @Min(0)
  public readonly take: number = 0;
  @IsMongoId()
  public readonly systemId: string = '';
  @ArrayMaxSize(2)
  @ArrayUnique()
  @IsArray()
  @IsMongoId({
    each: true
  })
  public readonly mustIncludeVariableSymbolIds: string[] = [];
  @ArrayUnique()
  @IsArray()
  @IsMongoId({
    each: true
  })
  public readonly mayIncludeVariableSymbolIds: string[] = [];
};
