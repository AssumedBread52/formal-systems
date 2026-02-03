import { IsEmail, IsMongoId, IsOptional } from 'class-validator';

export class FindOneByPayload {
  @IsMongoId()
  @IsOptional()
  public readonly id?: string;
  @IsEmail()
  @IsOptional()
  public readonly email?: string;
};
