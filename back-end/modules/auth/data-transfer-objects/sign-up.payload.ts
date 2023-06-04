import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignUpPayload {
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
};
