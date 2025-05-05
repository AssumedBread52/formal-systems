import { IsEmail } from 'class-validator';

export class ConflictPayload {
  @IsEmail()
  email: string = '';
};
