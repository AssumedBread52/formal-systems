import { IsArray, IsMongoId, IsOptional } from 'class-validator';

export class FindOneByPayload {
  @IsMongoId()
  @IsOptional()
  public readonly id?: string;
  @IsArray()
  @IsMongoId({
    each: true
  })
  @IsOptional()
  public readonly symbolIds?: string[];
  @IsMongoId()
  @IsOptional()
  public readonly systemId?: string;
};
