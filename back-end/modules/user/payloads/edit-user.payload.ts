import { IsEmail, IsNotEmpty, IsOptional, IsStrongPassword } from 'class-validator';

export class EditUserPayload {
  @IsNotEmpty()
  newFirstName: string = '';
  @IsNotEmpty()
  newLastName: string = '';
  @IsEmail()
  newEmail: string = '';
  @IsOptional()
  @IsStrongPassword()
  newPassword?: string;
};
