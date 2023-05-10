import { IsNotEmpty } from 'class-validator';

export class NewFormalSystemPayload {
  @IsNotEmpty()
  title: string = '';
  @IsNotEmpty()
  description: string = '';
};
