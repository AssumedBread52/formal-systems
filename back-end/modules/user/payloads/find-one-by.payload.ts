import { IsEmail, IsMongoId, IsOptional } from 'class-validator';

export class FindOneByPayload {
  @IsMongoId()
  @IsOptional()
  id?: string;
  @IsEmail()
  @IsOptional()
  email?: string;
};
