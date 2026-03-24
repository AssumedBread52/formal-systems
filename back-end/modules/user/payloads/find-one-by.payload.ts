import { IsEmail, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class FindOneByPayload {
  @IsMongoId()
  @IsOptional()
  public readonly id?: string;
  @IsNotEmpty()
  @IsOptional()
  public readonly handle?: string;
  @IsEmail()
  @IsOptional()
  public readonly email?: string;
};
