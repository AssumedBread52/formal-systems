import { IsNotEmpty } from 'class-validator';

export class JwtPayload {
  @IsNotEmpty()
  token: string = '';
};
