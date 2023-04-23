import { IsEmail, IsNotEmpty } from 'class-validator';

export class EditProfilePayload {
  @IsNotEmpty()
  public firstName: string = '';
  @IsNotEmpty()
  public lastName: string = '';
  @IsEmail()
  public email: string = '';
  public password?: string;
}
