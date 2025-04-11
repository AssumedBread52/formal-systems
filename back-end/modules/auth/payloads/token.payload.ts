import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class TokenPayload {
  @IsNotEmpty()
  userId: string = '';
  @IsInt()
  @IsPositive()
  iat: number = 0;
  @IsInt()
  @IsPositive()
  exp: number = 0;
};
