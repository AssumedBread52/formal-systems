import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class NewUserPayload {
  @IsNotEmpty()
  firstName: string = '';
  @IsNotEmpty()
  lastName: string = '';
  @IsEmail()
  email: string = '';
  @IsStrongPassword()
  password: string = '';
};
