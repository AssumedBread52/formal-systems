import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInPayload {
  @IsEmail()
  email: string = '';
  @IsNotEmpty()
  password: string = '';
};
