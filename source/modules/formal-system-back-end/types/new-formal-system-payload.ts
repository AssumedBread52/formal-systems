import { IsNotEmpty } from 'class-validator';

export class NewFormalSystemPayload {
  @IsNotEmpty()
  public title: string = '';
  @IsNotEmpty()
  public description: string = '';
};
