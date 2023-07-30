import { IsNotEmpty } from 'class-validator';

export class EditSystemPayload {
  @IsNotEmpty()
  newTitle: string = '';
  @IsNotEmpty()
  newDescription: string = '';
};
