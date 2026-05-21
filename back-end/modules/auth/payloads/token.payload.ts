import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class TokenPayload {
  @IsUUID()
  public readonly userId!: string;
  @IsInt()
  @IsPositive()
  public readonly iat!: number;
  @IsInt()
  @IsPositive()
  public readonly exp!: number;
};
