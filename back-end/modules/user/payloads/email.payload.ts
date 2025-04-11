import { IsEmail } from 'class-validator';

export class EmailPayload {
  @IsEmail()
  email: string = '';
};
