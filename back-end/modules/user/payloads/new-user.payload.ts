import { IsEmail, IsNotEmpty } from 'class-validator';

export class NewUserPayload {
  @IsNotEmpty()
  firstName: string = '';
  @IsNotEmpty()
  lastName: string = '';
  @IsEmail()
  email: string = '';
  @IsNotEmpty()
  password: string = '';
};
