import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class NewUserPayload {
  @IsNotEmpty()
  public readonly firstName: string = '';
  @IsNotEmpty()
  public readonly lastName: string = '';
  @IsEmail()
  public readonly email: string = '';
  @IsStrongPassword()
  public readonly password: string = '';
};
