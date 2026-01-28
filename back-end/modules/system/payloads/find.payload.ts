import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class FindPayload {
  @IsMongoId()
  @IsOptional()
  public readonly id?: string;
  @IsNotEmpty()
  @IsOptional()
  public readonly title?: string;
  @IsMongoId()
  @IsOptional()
  public readonly createdByUserId?: string;
};
