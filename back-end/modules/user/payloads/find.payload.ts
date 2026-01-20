import { IsEmail, IsMongoId, IsOptional } from 'class-validator';

export class FindPayload {
  @IsMongoId()
  @IsOptional()
  id?: string;
  @IsEmail()
  @IsOptional()
  email?: string;
};
