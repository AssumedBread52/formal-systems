import { IsNotEmpty } from 'class-validator';

export class TokenPayload {
  @IsNotEmpty()
  token: string = '';
};
