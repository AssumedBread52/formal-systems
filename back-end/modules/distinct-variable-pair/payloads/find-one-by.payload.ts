import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsMongoId, IsOptional } from 'class-validator';

export class FindOneByPayload {
  @IsMongoId()
  @IsOptional()
  public readonly id?: string;
  @ArrayUnique()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
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
