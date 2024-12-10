import { IsNotEmpty } from 'class-validator';

export class NewProofPayload {
  @IsNotEmpty()
  title: string = '';
  @IsNotEmpty()
  description: string = '';
  // any
  steps: any = null;
};
