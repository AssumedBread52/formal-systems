import { IsNotEmpty } from 'class-validator';

export class NewSystemPayload {
  @IsNotEmpty()
  title: string = '';
  @IsNotEmpty()
  description: string = '';
};
