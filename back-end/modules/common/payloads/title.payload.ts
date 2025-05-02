import { IsNotEmpty } from 'class-validator';

export class TitlePayload {
  @IsNotEmpty()
  title: string = '';
};
