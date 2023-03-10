import { IsEmail, IsNotEmpty } from 'class-validator';

export class ServerUser {
  @IsNotEmpty()
  public firstName: string = '';
  @IsNotEmpty()
  public lastName: string = '';
  @IsEmail()
  public email: string = '';
  @IsNotEmpty()
  public hashedPassword: string = '';
}
