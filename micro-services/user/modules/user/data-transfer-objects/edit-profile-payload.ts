import { IsEmail, IsNotEmpty } from 'class-validator';

export class EditProfilePayload {
  @IsNotEmpty()
  public newFirstName: string = '';
  @IsNotEmpty()
  public newLastName: string = '';
  @IsEmail()
  public newEmail: string = '';
  public newPassword?: string;
}
