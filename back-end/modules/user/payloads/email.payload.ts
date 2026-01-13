import { IsEmail } from 'class-validator';

export class EmailPayload {
  @IsEmail()
  public readonly email: string = '';
};
