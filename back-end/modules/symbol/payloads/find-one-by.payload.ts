import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class FindOneByPayload {
  @IsMongoId()
  @IsOptional()
  public readonly id?: string;
  @IsNotEmpty()
  @IsOptional()
  public readonly title?: string;
  @IsMongoId()
  @IsOptional()
  public readonly systemId?: string;
};
