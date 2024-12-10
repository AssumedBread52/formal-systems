import { IsNotEmpty } from 'class-validator';

export class EditProofPayload {
  @IsNotEmpty()
  newTitle: string = '';
  @IsNotEmpty()
  newDescription: string = '';
  // any
  newSteps: any = null;
};
