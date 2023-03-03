import { IsNotEmpty } from 'class-validator';

export class IdResponse {
  @IsNotEmpty()
  id: string = '';
};
