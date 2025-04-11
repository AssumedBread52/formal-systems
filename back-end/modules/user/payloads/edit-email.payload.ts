import { IsEmail } from 'class-validator';

export class EditEmailPayload {
  @IsEmail()
  newEmail: string = '';
};
