import { IsEmail, IsNotEmpty } from 'class-validator';

export class ServerUser {
  @IsNotEmpty()
  _id: string = '';
  @IsNotEmpty()
  firstName: string = '';
  @IsNotEmpty()
  lastName: string = '';
  @IsEmail()
  email: string = '';
  @IsNotEmpty()
  hashedPassword: string = '';
};
