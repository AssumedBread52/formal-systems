import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserPayload {
  @IsNotEmpty()
  firstName: string = '';
  @IsNotEmpty()
  lastName: string = '';
  @IsEmail()
  email: string = '';
  @IsNotEmpty()
  hashedPassword: string = '';
};
