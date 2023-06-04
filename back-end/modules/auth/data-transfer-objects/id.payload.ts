import { IsNotEmpty } from 'class-validator';

export class IdPayload {
  @IsNotEmpty()
  id: string;
};
