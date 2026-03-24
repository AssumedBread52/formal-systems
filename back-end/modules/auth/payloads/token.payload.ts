import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class TokenPayload {
  @IsUUID()
  public readonly userId: string = '';
  @IsInt()
  @IsPositive()
  public readonly iat: number = 0;
  @IsInt()
  @IsPositive()
  public readonly exp: number = 0;
};
