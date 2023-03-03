import { IsEmail, IsNotEmpty } from 'class-validator';

export class SessionUser {
  @IsNotEmpty()
  public firstName: string = '';
  @IsNotEmpty()
  public lastName: string = '';
  @IsEmail()
  public email: string = '';
}
