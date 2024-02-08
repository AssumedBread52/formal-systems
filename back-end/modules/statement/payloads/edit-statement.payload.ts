import { IsNotEmpty } from 'class-validator';

export class EditStatementPayload {
  @IsNotEmpty()
  newTitle: string = '';
  @IsNotEmpty()
  newDescription: string = '';
};
