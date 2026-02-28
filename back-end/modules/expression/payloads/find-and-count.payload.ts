import { ExpressionType } from '@/expression/enums/expression-type.enum';
import { ArrayMaxSize, ArrayUnique, IsArray, IsEnum, IsInt, IsMongoId, Min } from 'class-validator';

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
  @IsMongoId({
    each: true
  })
  public readonly mustIncludeSymbolIds: string[] = [];
  @ArrayUnique()
  @IsArray()
  @IsMongoId({
    each: true
  })
  public readonly mayIncludeSymbolIds: string[] = [];
  @ArrayMaxSize(Object.keys(ExpressionType).length)
  @ArrayUnique()
  @IsArray()
  @IsEnum(ExpressionType, {
    each: true
  })
  public readonly types: ExpressionType[] = [];
};
