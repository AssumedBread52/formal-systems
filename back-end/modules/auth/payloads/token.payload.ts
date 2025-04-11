import { IsInt, IsMongoId, IsPositive } from 'class-validator';

export class TokenPayload {
  @IsMongoId()
  userId: string = '';
  @IsInt()
  @IsPositive()
  iat: number = 0;
  @IsInt()
  @IsPositive()
  exp: number = 0;
};
