import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignUpPayload {
  @IsNotEmpty()
  public firstName: string = '';
  @IsNotEmpty()
  public lastName: string = '';
  @IsEmail()
  public email: string = '';
  @IsNotEmpty()
  public password: string = '';
}
