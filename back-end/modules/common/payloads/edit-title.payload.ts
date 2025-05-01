import { IsNotEmpty } from 'class-validator';

export class EditTitlePayload {
  @IsNotEmpty()
  newTitle: string = '';
};
