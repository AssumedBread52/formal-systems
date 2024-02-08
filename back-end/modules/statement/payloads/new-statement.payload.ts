import { IsNotEmpty } from 'class-validator';

export class NewStatementPayload {
  @IsNotEmpty()
  title: string = '';
  @IsNotEmpty()
  description: string = '';
};
