import { IsEmail, IsNotEmpty } from 'class-validator';

export class EditProfilePayload {
  @IsNotEmpty()
  newFirstName: string = '';
  @IsNotEmpty()
  newLastName: string = '';
  @IsEmail()
  newEmail: string = '';
  newPassword?: string;
};
