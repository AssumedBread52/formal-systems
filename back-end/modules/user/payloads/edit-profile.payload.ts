import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class EditProfilePayload {
  @IsNotEmpty()
  newFirstName: string = '';
  @IsNotEmpty()
  newLastName: string = '';
  @IsEmail()
  newEmail: string = '';
  @IsNotEmpty()
  @IsOptional()
  newPassword?: string;
};
