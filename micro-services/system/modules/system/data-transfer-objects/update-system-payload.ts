import { IsNotEmpty } from 'class-validator';

export class UpdateSystemPayload {
  @IsNotEmpty()
  title: string = '';
  @IsNotEmpty()
  description: string = '';
};
