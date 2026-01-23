import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class FindPayload {
  @IsMongoId()
  @IsOptional()
  id?: string;
  @IsNotEmpty()
  @IsOptional()
  title?: string;
  @IsMongoId()
  @IsOptional()
  createdByUserId?: string;
};
