import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsMongoId, IsOptional } from 'class-validator';

export class FindOneByPayload {
  @IsMongoId()
  @IsOptional()
  public readonly id?: string;
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  @ArrayUnique()
  @IsArray()
  @IsMongoId({
    each: true
  })
  @IsOptional()
  public readonly variableSymbolIds?: [string, string];
  @IsMongoId()
  @IsOptional()
  public readonly systemId?: string;
};
