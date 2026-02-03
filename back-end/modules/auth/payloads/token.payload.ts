import { IsInt, IsMongoId, IsPositive } from 'class-validator';

export class TokenPayload {
  @IsMongoId()
  public readonly userId: string = '';
  @IsInt()
  @IsPositive()
  public readonly iat: number = 0;
  @IsInt()
  @IsPositive()
  public readonly exp: number = 0;
};
